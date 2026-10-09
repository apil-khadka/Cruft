import {
  ArrowRight,
  Code2,
  ExternalLink,
  FolderSearch,
  GitBranch,
  HardDrive,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import "./MarketingSite.css";

const repository = "https://github.com/apil-khadka/Cruft";

export function MarketingSite() {
  return (
    <div className="cruft-site">
      <header className="cruft-header">
        <a className="cruft-brand" href="#top" aria-label="Cruft home">
          <span className="cruft-brand-mark">
            <ShieldCheck size={19} strokeWidth={2.2} />
          </span>
          <span>Cruft</span>
        </a>
        <nav aria-label="Main navigation" className="cruft-nav">
          <a href="#workflow">How it works</a>
          <a href="#safety">Safety</a>
          <a href="#pricing">Pricing</a>
          <a className="cruft-nav-cta" href="#download">
            Get Cruft <ArrowRight size={15} />
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="cruft-hero">
          <div className="cruft-hero-copy">
            <div className="cruft-eyebrow">
              <span className="cruft-dot" /> A desktop utility for developers
            </div>
            <h1>Make room for the projects you’re working on.</h1>
            <p>
              Cruft scans a folder you choose for bulky dependency directories and developer caches.
              Review the local results and Git context before selecting what to clean.
            </p>
            <div className="cruft-hero-actions">
              <a
                className="cruft-button cruft-button-primary"
                href={`${repository}/releases`}
                target="_blank"
                rel="noreferrer"
              >
                Browse desktop releases <ExternalLink size={15} />
              </a>
              <a className="cruft-button cruft-button-quiet" href="#workflow">
                See the workflow <ArrowRight size={15} />
              </a>
            </div>
            <div className="cruft-hero-notes">
              <span>
                <HardDrive size={15} /> Runs on your machine
              </span>
              <span>
                <Code2 size={15} /> No account or cloud workspace
              </span>
            </div>
          </div>

          <div
            className="cruft-preview-wrap"
            aria-label="Cruft desktop application interface preview"
          >
            <div className="cruft-preview-label">The desktop app</div>
            <div className="cruft-window">
              <div className="cruft-window-titlebar">
                <div className="cruft-window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="cruft-window-title">
                  <ShieldCheck size={14} /> Cruft
                </div>
                <span className="cruft-window-spacer" />
              </div>
              <div className="cruft-window-tabs">
                <div className="cruft-tab cruft-tab-active">
                  <FolderSearch size={15} /> Project targets
                </div>
                <div className="cruft-tab">
                  <HardDrive size={15} /> System caches
                </div>
              </div>
              <div className="cruft-window-content">
                <div className="cruft-window-heading">
                  <div>
                    <div className="cruft-mini-label">LOCAL SCAN</div>
                    <h2>Project targets</h2>
                    <p>Inspect dependency folders before cleanup.</p>
                  </div>
                  <span className="cruft-window-action">Choose folder</span>
                </div>
                <div className="cruft-empty-state">
                  <div className="cruft-empty-icon">
                    <FolderSearch size={22} />
                  </div>
                  <strong>Select a folder to begin</strong>
                  <span>Scan results stay in this app while you review them.</span>
                </div>
                <div className="cruft-preview-footer">
                  <span>
                    <GitBranch size={13} /> Git context when available
                  </span>
                  <span>
                    <ShieldCheck size={13} /> Review before cleanup
                  </span>
                </div>
              </div>
            </div>
            <p className="cruft-preview-caption">
              Illustrative view · no project paths or scan results shown
            </p>
          </div>
        </section>

        <section className="cruft-proof-strip" aria-label="Product scope">
          <div>
            <strong>Project folders</strong>
            <span>node_modules, target, vendor, .venv and more</span>
          </div>
          <div>
            <strong>Git context</strong>
            <span>Recent activity and repository state</span>
          </div>
          <div>
            <strong>Developer caches</strong>
            <span>Local tools and package ecosystems</span>
          </div>
        </section>

        <section className="cruft-section cruft-workflow" id="workflow">
          <div className="cruft-section-intro">
            <div className="cruft-eyebrow">A reviewable local workflow</div>
            <h2>Find candidates. Choose what leaves.</h2>
            <p>
              Cruft scans only after you select a starting folder. The app streams findings into a
              list so you can inspect each candidate and its available repository context.
            </p>
          </div>
          <ol className="cruft-steps">
            <li>
              <span>01</span>
              <FolderSearch size={19} />
              <h3>Choose a workspace</h3>
              <p>Use the native folder picker to select a directory for a local scan.</p>
            </li>
            <li>
              <span>02</span>
              <GitBranch size={19} />
              <h3>Review the findings</h3>
              <p>
                Sort project targets by size, activity or staleness, and inspect Git signals where
                available.
              </p>
            </li>
            <li>
              <span>03</span>
              <Trash2 size={19} />
              <h3>Select and confirm</h3>
              <p>
                Choose eligible folders, review the summary, then confirm before cleanup begins.
              </p>
            </li>
          </ol>
        </section>

        <section className="cruft-feature-band">
          <div className="cruft-section cruft-features">
            <div className="cruft-section-intro">
              <div className="cruft-eyebrow">Made for project clutter</div>
              <h2>One place to inspect the space that builds leave behind.</h2>
            </div>
            <div className="cruft-feature-list">
              <article>
                <FolderSearch size={19} />
                <div>
                  <h3>Dependency directories</h3>
                  <p>
                    Find common bulky project folders across a workspace, including Node, Rust,
                    Python and PHP targets.
                  </p>
                </div>
              </article>
              <article>
                <GitBranch size={19} />
                <div>
                  <h3>Repository signals</h3>
                  <p>
                    See available recent-commit, remote and unpushed-commit context to inform your
                    review.
                  </p>
                </div>
              </article>
              <article>
                <HardDrive size={19} />
                <div>
                  <h3>System cache review</h3>
                  <p>
                    Inspect known local caches for tools such as Cargo, npm, pnpm, pip, Homebrew and
                    Docker.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="cruft-section cruft-safety" id="safety">
          <div className="cruft-safety-mark">
            <TriangleAlert size={21} />
          </div>
          <div className="cruft-safety-copy">
            <div className="cruft-eyebrow cruft-eyebrow-danger">Read before cleanup</div>
            <h2>Cleanup can permanently remove files.</h2>
            <p>
              Project target removal is limited to known directory names and requires confirmation.
              The app moves files to the operating system Trash and stops if that operation fails.
              Docker cleanup uses Docker’s system-prune command, not the Trash, and describes the
              removal scope in its confirmation prompt.
            </p>
            <p>
              Review selected paths and the confirmation prompt before proceeding. Keep backups of
              anything you may need.
            </p>
          </div>
          <div className="cruft-safety-checks">
            <div>
              <ShieldCheck size={16} />
              <span>Known target-name allowlist for project folders</span>
            </div>
            <div>
              <Trash2 size={16} />
              <span>Trash deletion aborts safely when the OS operation fails</span>
            </div>
            <div>
              <TriangleAlert size={16} />
              <span>Docker cleanup scope is disclosed before confirmation</span>
            </div>
          </div>
        </section>

        <section className="cruft-download" id="download">
          <div className="cruft-download-inner">
            <div>
              <div className="cruft-eyebrow">Desktop distribution</div>
              <h2>Get Cruft from its release page.</h2>
              <p>
                Release installers belong on GitHub Releases. If no published release is available
                yet, follow the repository while distribution is prepared.
              </p>
            </div>
            <a
              className="cruft-button cruft-button-primary"
              href={`${repository}/releases`}
              target="_blank"
              rel="noreferrer"
            >
              Open GitHub Releases <ExternalLink size={15} />
            </a>
          </div>
        </section>

        <section className="cruft-section cruft-pricing" id="pricing">
          <div className="cruft-pricing-copy">
            <div className="cruft-eyebrow">Pricing &amp; licensing</div>
            <h2>No subscription offer is configured.</h2>
            <p>
              Cruft is currently a local desktop utility. The repository has no account service,
              subscription billing, checkout or published product price. The project should decide
              whether its distribution is free, paid once, or tied to a future hosted service before
              making a pricing promise.
            </p>
          </div>
          <div className="cruft-pricing-status">
            <span className="cruft-status-line">
              <i /> Billing not implemented
            </span>
            <span className="cruft-status-line">
              <i /> Subscription or trial terms not set
            </span>
            <span className="cruft-status-line">
              <i /> License file needs confirmation
            </span>
            <a href={`${repository}/blob/main/README.md`} target="_blank" rel="noreferrer">
              Review project source <ExternalLink size={14} />
            </a>
          </div>
        </section>

        <section className="cruft-section cruft-privacy" id="privacy">
          <div className="cruft-eyebrow">Privacy notes · draft</div>
          <h2>Local scans, with no account or sync service in this build.</h2>
          <p>
            The reviewed desktop code scans folders on the device and holds scan results in
            application state. It contains no user account, billing flow, backend sync or analytics
            client. Opening a release or source link sends a request to GitHub under its own service
            terms. The operator, website host and support contact still need to be established
            before this becomes a final privacy notice.
          </p>
        </section>

        <section className="cruft-section cruft-terms" id="terms">
          <div className="cruft-eyebrow">Use &amp; support</div>
          <h2>Keep the cleanup decision yours.</h2>
          <p>
            Cruft reports local candidates; it does not decide which folders are safe for your work.
            Check paths and repository state first. Project targets and caches remain in place if
            Trash is unavailable. Cache cleanup can remove tool-managed data, and Docker prune has
            its own system-wide scope that is shown before confirmation.
          </p>
          <div className="cruft-terms-links">
            <a href={`${repository}/issues`} target="_blank" rel="noreferrer">
              Project issues &amp; feedback <ExternalLink size={14} />
            </a>
            <a href={`${repository}/blob/main/README.md`} target="_blank" rel="noreferrer">
              Current README <ExternalLink size={14} />
            </a>
          </div>
        </section>
      </main>

      <footer className="cruft-footer">
        <a className="cruft-brand" href="#top">
          <span className="cruft-brand-mark">
            <ShieldCheck size={17} />
          </span>
          <span>Cruft</span>
        </a>
        <span className="cruft-footer-note">
          Local developer-disk utility · subscription plans not available
        </span>
        <nav aria-label="Footer navigation">
          <a href="#pricing">Pricing status</a>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Use &amp; support</a>
          <a href={`${repository}/releases`} target="_blank" rel="noreferrer">
            Releases <ExternalLink size={12} />
          </a>
        </nav>
      </footer>
    </div>
  );
}
