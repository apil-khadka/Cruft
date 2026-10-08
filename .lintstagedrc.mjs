export default {
  // TypeScript / TSX — fix ESLint then format with Prettier
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],

  // Other JS / config / markup files — Prettier only
  "*.{js,mjs,cjs,json,md,yaml,yml,css,html}": ["prettier --write"],

  // Rust source files — run cargo fmt on the whole crate
  // (cargo fmt doesn't accept individual file paths, so we ignore the file list)
  "src-tauri/**/*.rs": () => "cargo fmt --manifest-path src-tauri/Cargo.toml",
};
