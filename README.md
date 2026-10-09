# Cruft

> A lightning-fast developer tool to identify and safely reclaim disk space taken up by dependency directories and system caches.

[![CI](https://github.com/apil-khadka/Cruft/actions/workflows/build.yml/badge.svg)](https://github.com/apil-khadka/Cruft/actions/workflows/build.yml)
[![Latest Release](https://img.shields.io/github/v/release/apil-khadka/Cruft)](https://github.com/apil-khadka/Cruft/releases/latest)

---

## Features

|     | Feature                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 🔍  | **Recursive scanning** — parallelised (`jwalk`) traversal finds `node_modules`, `target`, `vendor`, `.venv`, `dist`, `.next`, `.nuxt` |
| 🧹  | **Safe deletion** — moves to Trash and aborts if the Trash operation fails                                                            |
| 🔒  | **Safety guards** — deletion is blocked unless the directory name is in the known TARGETS allowlist                                   |
| 📡  | **Real-time streaming** — results appear live as the scanner runs, via Tauri 2.0 IPC channels                                         |
| 🔀  | **Git intelligence** — detects stale repos (90-day threshold), missing remotes, and truly unpushed commits                            |
| 💾  | **System cache analyser** — Cargo, npm, pnpm, Yarn, pip, Homebrew, Gradle, Maven, and Docker                                          |
| 🎨  | **Modern UI** — sortable colour-coded grid, multi-select, bulk clean, toast notifications                                             |
| 🖥️  | **Deep OS integration** — Reveal in Finder / Explorer, Open in VS Code                                                                |

---

## Download

The tag workflow is configured to build installers for these platforms as a draft GitHub release. The release owner must review and publish the draft before users can download it. Each platform job attaches a SHA-256 manifest; compare a downloaded file with its manifest before installation.

| Platform                                         | Installer            |
| ------------------------------------------------ | -------------------- |
| macOS (Apple Silicon + Intel — Universal Binary) | `.dmg`               |
| Windows                                          | `.msi` + NSIS `.exe` |
| Linux                                            | `.deb` + `.AppImage` |

macOS notarization and Windows signing require repository secrets and are not configured by this checkout. Unsigned installers may trigger operating-system security prompts. Updates are manual downloads from the Releases page; the app has no automatic updater.

---

## Development

### Prerequisites

| Tool                           | Minimum version |
| ------------------------------ | --------------- |
| [Node.js](https://nodejs.org/) | 22              |
| [pnpm](https://pnpm.io/)       | 10              |
| [Rust](https://rustup.rs/)     | stable          |
| [Git](https://git-scm.com/)    | any             |

**Linux only** — install WebKit2GTK dev libraries:

```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf
```

### Getting started

```bash
# 1. Clone
git clone https://github.com/apil-khadka/Cruft.git
cd Cruft

# 2. Install JS dependencies + initialise Husky git hooks
pnpm install

# 3. Start the app in development mode (Vite + Tauri hot-reload)
pnpm tauri dev
```

### Project structure

```
Cruft/
├── src/                        # React + TypeScript frontend
│   ├── components/
│   │   ├── ProjectCard.tsx     # Individual project result card
│   │   ├── SystemCacheCard.tsx # System cache entry card
│   │   └── WindowControls.tsx  # Custom macOS-style traffic lights
│   └── lib/
│       └── api.ts              # Shared types + formatBytes helper
├── src-tauri/                  # Rust backend (Tauri 2.0)
│   ├── src/
│   │   ├── analyzer.rs         # Directory scanner, Git intelligence, ScanEvent IPC
│   │   ├── global_cache.rs     # System-wide cache analyser
│   │   ├── utils.rs            # Shared utilities (calculate_dir_size)
│   │   └── lib.rs              # Tauri builder + command registration
│   ├── capabilities/
│   │   └── default.json        # IPC permission allowlist
│   ├── Cargo.toml
│   └── tauri.conf.json
├── .github/workflows/
│   ├── build.yml               # CI — lint + build on every push/PR
│   └── release.yml             # Release — builds installers on vX.Y.Z tag push
├── scripts/
│   ├── sync-version.mjs        # Keeps package.json / Cargo.toml / tauri.conf.json in sync
│   └── write-release-checksums.mjs # Creates the platform SHA-256 manifest
├── conductor/                  # Project planning docs
└── CHANGELOG.md
```

### Tech stack

| Layer                | Technology                                                      |
| -------------------- | --------------------------------------------------------------- |
| Frontend             | React 18 + TypeScript + Vite 6                                  |
| Styling              | Tailwind CSS 3                                                  |
| Icons                | lucide-react                                                    |
| Desktop shell        | Tauri 2.0                                                       |
| File traversal       | `jwalk` (parallelised, rayon-backed)                            |
| Git metadata         | `git2`                                                          |
| Deletion             | `trash` crate (system Trash integration; aborts if Trash fails) |
| Cross-platform paths | `dirs` crate                                                    |

---

## Commit convention

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) via Husky + commitlint.

| Prefix                                                            | Effect on version    |
| ----------------------------------------------------------------- | -------------------- |
| `fix:`                                                            | Patch bump → `0.0.X` |
| `feat:`                                                           | Minor bump → `0.X.0` |
| `feat!:` / `BREAKING CHANGE:`                                     | Major bump → `X.0.0` |
| `chore:`, `docs:`, `style:`, `refactor:`, `test:`, `ci:`, `perf:` | No version bump      |

**Examples**

```
feat: add Python virtualenv (.venv) scanning
fix: window controls unresponsive on Linux
docs: add macOS signing instructions to README
chore(deps): bump tauri to 2.1.0
```

---

## Releasing

> **Prerequisite** — set a `GITHUB_TOKEN` environment variable with `repo` scope, or configure one in your shell profile.

```bash
# Dry-run — see what would happen without making any changes
pnpm release --dry-run

# Interactive release — prompts for the version bump type
pnpm release
```

`pnpm release` will:

1. Run `pnpm lint` and `tsc --noEmit` (fails fast on any errors)
2. Infer the next version from commit history (patch / minor / major)
3. Append the changelog section to `CHANGELOG.md`
4. Bump the version in `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`
5. Commit all changes as `chore: release vX.Y.Z`
6. Push a `vX.Y.Z` git tag to `origin/main`

Pushing the tag automatically triggers `.github/workflows/release.yml`, which:

- Builds macOS (Universal), Linux, and Windows installers in parallel
- Creates a **draft** GitHub release with the installers attached
- Leaves the release in draft so you can review and publish it manually

### Code signing (optional)

To produce notarized macOS and signed Windows binaries, add the following secrets in **GitHub → Settings → Secrets and variables → Actions**:

**macOS notarization** — requires an Apple Developer account ($99/year):

| Secret                       | Description                                                            |
| ---------------------------- | ---------------------------------------------------------------------- |
| `APPLE_CERTIFICATE`          | Base64-encoded `.p12` Developer ID certificate                         |
| `APPLE_CERTIFICATE_PASSWORD` | `.p12` export password                                                 |
| `APPLE_SIGNING_IDENTITY`     | Signing identity string (e.g. `Developer ID Application: Name (TEAM)`) |
| `APPLE_ID`                   | Apple ID email                                                         |
| `APPLE_PASSWORD`             | App-specific password for the Apple ID                                 |
| `APPLE_TEAM_ID`              | 10-character Apple Team ID                                             |

Windows Authenticode signing is not configured. Tauri updater-signing keys do
not sign installers or remove SmartScreen warnings; this app currently has no
automatic updater.

---

## Contributing

Pull requests are welcome! Please:

1. Fork the repo and create a feature branch off `main`
2. Follow the commit convention above — Husky will reject non-conforming messages
3. Run `pnpm lint` and `pnpm typecheck` before pushing
4. Open a PR with a clear description of the change

---

## License

[MIT](LICENSE)
