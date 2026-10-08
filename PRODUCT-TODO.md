# Cruft product readiness

## Verified product status

- Cruft is a Tauri desktop utility that scans user-selected folders for developer dependency directories and local caches.
- The desktop app has no customer account, hosted workspace, subscription provider, billing page, price configuration, or trial service.
- The browser root now introduces the product and points to the repository's Releases page; the existing native app remains the desktop experience.
- No subscription price or recurring plan is advertised. A subscription would need an actual recurring hosted service to justify it.
- Project-target deletion first calls the operating-system Trash integration, then silently falls back to permanent deletion if that fails. Docker cleanup invokes `docker system prune -af`.
- The README advertises an MIT license, but this checkout does not contain a `LICENSE` file. Confirm the intended license before public distribution.

## Next actions

- [ ] **Resolve deletion failure behavior.** Replace silent permanent-delete fallback with a second, explicit warning/confirmation or abort the operation when Trash fails. Apply the same rule to project folders and package caches.
- [ ] **Make Docker cleanup scope explicit in the application flow.** Explain the effect of the exact prune command before the user confirms it; preserve the command output and report its result.
- [ ] **Choose the commercial model.** Decide whether Cruft remains a free local desktop utility, is sold once, or gains a hosted service with concrete recurring value. Do not add SaaS tiers, trials, checkout, sign-up or subscription copy before this decision and implementation.
- [ ] **Complete distribution.** Publish real platform artifacts to GitHub Releases; document tested operating-system versions, installation steps, checksums, signing/notarization status and update behavior.
- [ ] **Resolve license and operator details.** Add the intended license text, identify who distributes the app, and select a support channel before treating the current privacy/use notes as final terms.
- [ ] **Set the permanent desktop bundle identifier before the first public install.** The current `com.project-analyzer.app` value is a template identifier and Tauri warns that its `.app` suffix conflicts with macOS bundle naming. Choose an owner-controlled reverse-DNS identifier once, before users depend on an installed app identity.
- [ ] **Decide on a product domain and deployment.** The current landing page is part of the Vite frontend, while Tauri continues to open the desktop tool. Choose and document a public hosting target and canonical domain before setting canonical metadata.
- [ ] **Visually review the desktop utility by platform.** Check scan progress, Git status, caches, confirmation steps, error recovery and destructive actions on macOS, Windows and Linux.

## Decision boundary

Keep the current app local-first. A hosted subscription is a separate product decision that would require an operator, service infrastructure, support, pricing, data policy and billing lifecycle; do not imitate those systems on the public page.
