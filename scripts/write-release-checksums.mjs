import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const label = process.argv[2];
const bundleRoot = resolve(process.argv[3] ?? "src-tauri/target");
if (!label || !/^[a-z0-9-]+$/.test(label)) {
  throw new Error(
    "Usage: node scripts/write-release-checksums.mjs <platform-label> [bundle-directory]"
  );
}

const installerExtensions = new Set([".appimage", ".deb", ".dmg", ".exe", ".msi"]);
async function findInstallers(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return findInstallers(path);
      const extension = entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase();
      return installerExtensions.has(extension) ? [path] : [];
    })
  );
  return files.flat().sort();
}

const installers = await findInstallers(bundleRoot);
if (installers.length === 0) {
  throw new Error(`No installer artifacts found under ${bundleRoot}`);
}

const lines = await Promise.all(
  installers.map(async (path) => {
    const digest = createHash("sha256")
      .update(await readFile(path))
      .digest("hex");
    return `${digest}  ${basename(path)}`;
  })
);
const manifest = resolve(`SHA256SUMS-${label}.txt`);
await writeFile(manifest, `${lines.join("\n")}\n`, { flag: "w" });
process.stdout.write(`Wrote ${manifest} for ${installers.length} installer(s).\n`);
