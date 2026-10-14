# Local landing development

The site uses plain HTML, CSS and JavaScript. No package install is required.
Use Node 24 or newer. All commands run from this repository.

- `node scripts/lifecycle.mjs check`: sequential syntax, content and HTTP checks.
- `node scripts/lifecycle.mjs build`: those checks plus deterministic public output in dist.
- `node scripts/lifecycle.mjs preview`: loopback-only preview for at most 14 minutes.
- `node scripts/lifecycle.mjs audit`: check for leftover lifecycle locks.
- `node scripts/lifecycle.mjs foundation`: verify the runner itself.

The lifecycle owner holds one exclusive lock, launches direct shell:false Node
children, enforces deadlines, reports progress and owns interruption cleanup.
Node permissions prohibit subprocesses, workers and addons in children; an IPC
disconnect ends the child if its parent disappears. A duplicate run preserves
the existing owner's lock. Never delete a remaining lock without establishing
its exact process ownership. Run audit immediately after every commit and check
the recorded owner/child PIDs against process creation time and command line if
a run was interrupted externally.

Preview uses port 4186 by default; YINKIE_LANDING_PORT may select a different
explicit port. It serves only allowlisted public assets, never the Git directory,
samples or development documentation. Stop it before running another command.
Build output follows the same allowlist and excludes raw screenshots and samples.

Edit default English in index.html and synchronize it with locales.js.
Locale selection follows an explicit local preference, then browser languages,
then English. Theme follows the system until the visitor selects a preference.
The static English page remains readable without JavaScript.

Anonymous landing analytics is documented in [landing-analytics.md](landing-analytics.md).
The client has no persistent visitor identity; production sending remains disabled
until its separate receiver is available. The bounded checks include behavioral
analytics tests and exact download-link markers. Public output now contains 16 files.

Publishing and DNS configuration are separate, explicitly authorized work.
CNAME and canonical metadata describe the intended yinkie.com destination;
they do not configure DNS or assert that either domain is live.

Both sites use the shared v2 client and contract. The Website statistics panel stores only a persistent opt-out flag; page/event IDs remain in memory. `node scripts/lifecycle.mjs unified` runs focused fake-transport checks.
