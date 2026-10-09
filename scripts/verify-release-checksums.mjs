import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const manifestPath = process.argv[2];
const artifactDirectory = resolve(process.argv[3] ?? ".");
if (!manifestPath) {
  throw new Error(
    "Usage: node scripts/verify-release-checksums.mjs <manifest> [artifact-directory]"
  );
}

const manifest = await readFile(resolve(manifestPath), "utf8");
const entries = manifest.split(/\r?\n/).filter((line) => line.length > 0);
if (entries.length === 0) throw new Error("Checksum manifest is empty");
const requestedNames = process.argv.slice(4);
if (requestedNames.some((name) => basename(name) !== name)) {
  throw new Error("Artifact arguments must be file names without directory paths");
}

const seen = new Set();
const indexed = new Map();
for (const [index, line] of entries.entries()) {
  const match = /^([a-f0-9]{64})  ([^/\\]+)$/.exec(line);
  if (!match) throw new Error(`Invalid checksum entry on line ${index + 1}`);
  const [, expected, name] = match;
  if (name === "." || name === ".." || basename(name) !== name) {
    throw new Error(`Invalid artifact name on line ${index + 1}`);
  }
  if (seen.has(name)) throw new Error(`Duplicate artifact entry: ${name}`);
  seen.add(name);
  indexed.set(name, expected);
}

const namesToVerify = requestedNames.length === 0 ? [...indexed.keys()] : requestedNames;
for (const name of namesToVerify) {
  const expected = indexed.get(name);
  if (!expected) throw new Error(`Artifact is not listed in manifest: ${name}`);

  const artifactPath = await findArtifact(artifactDirectory, name);
  const digest = createHash("sha256")
    .update(await readFile(artifactPath))
    .digest("hex");
  if (digest !== expected) throw new Error(`Checksum mismatch: ${name}`);
  process.stdout.write(`OK ${name}\n`);
}

async function findArtifact(directory, name) {
  const entries = await readdir(directory, { withFileTypes: true });
  const matches = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return findArtifactMatches(path, name);
      return entry.name === name ? [path] : [];
    })
  );
  const paths = matches.flat();
  if (paths.length === 0) throw new Error(`Artifact not found: ${name}`);
  if (paths.length > 1) throw new Error(`Artifact name is ambiguous: ${name}`);
  return paths[0];
}

async function findArtifactMatches(directory, name) {
  try {
    return [await findArtifact(directory, name)];
  } catch (error) {
    if (error instanceof Error && error.message === `Artifact not found: ${name}`) return [];
    throw error;
  }
}
