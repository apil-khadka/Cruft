/**
 * sync-version.mjs
 *
 * Reads the canonical version from package.json and writes it into
 * src-tauri/Cargo.toml and src-tauri/tauri.conf.json so all three
 * files stay in lock-step.
 *
 * Invoked automatically by `pnpm release` via the release-it
 * `after:bump` hook. Can also be run manually:
 *
 *   node scripts/sync-version.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(__dirname, "..");

// ── 1. Read the canonical version ─────────────────────────────────────────

const pkgPath = resolve(root, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const { version } = pkg;

if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
  console.error(`sync-version: invalid version "${version}" in package.json`);
  process.exit(1);
}

// ── 2. Update src-tauri/Cargo.toml ────────────────────────────────────────

const cargoPath = resolve(root, "src-tauri", "Cargo.toml");
let cargo = readFileSync(cargoPath, "utf8");

// Only replace the first `version = "…"` line (the [package] section version)
cargo = cargo.replace(/^(version\s*=\s*)"[^"]*"/m, `$1"${version}"`);
writeFileSync(cargoPath, cargo, "utf8");

// ── 3. Update src-tauri/tauri.conf.json ───────────────────────────────────

const tauriConfPath = resolve(root, "src-tauri", "tauri.conf.json");
const tauriConf = JSON.parse(readFileSync(tauriConfPath, "utf8"));
tauriConf.version = version;
writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + "\n", "utf8");

// ── Done ──────────────────────────────────────────────────────────────────

console.log(`sync-version: bumped Cargo.toml + tauri.conf.json → v${version}`);
