<p align="center">
  <img src="./assets/yinkie-icon.png" width="104" alt="Yinkie logo">
</p>

<h1 align="center">Yinkie</h1>

<p align="center">
  <strong>Edit Markdown visually. Save ordinary .md files.</strong>
</p>

<p align="center">
  Format headings, lists and tables visually. Switch to source for precise edits.<br>
  Keep local <code>.md</code> files you can open in other editors.
</p>

<p align="center">
  <a href="https://yinkie.com"><strong>Website</strong></a>
  &nbsp;&middot;&nbsp;
  <a href="https://yinkie.app"><strong>Open the web editor</strong></a>
  &nbsp;&middot;&nbsp;
  <a href="https://github.com/TrinkieYinkie/Yinkie_releases/releases/latest"><strong>Download Yinkie</strong></a>
</p>

<p align="center">
  <img alt="Local-first" src="https://img.shields.io/badge/local--first-383B42?style=flat-square">
  <img alt="Plain Markdown" src="https://img.shields.io/badge/format-plain%20Markdown-6B625B?style=flat-square">
  <img alt="No account required" src="https://img.shields.io/badge/account-not%20required-4E6A58?style=flat-square">
</p>

<p align="center">
  <img src="./assets/screenshots/yinkie-writing-dark.webp" width="100%" alt="The City at Blue Hour essay in the Yinkie Desktop Visual editor, with the demo folder tree.">
</p>

## Edit Markdown with visual formatting tools

Yinkie gives ordinary Markdown documents a polished writing surface. There is
no proprietary project format and no database between you and your words — just
files you can open in Yinkie, a code editor, or any other Markdown app.

Use **Visual** mode when you want to focus on writing. Open **Source** when exact
syntax matters. Turn on **Preview** beside your source to see the result as you
work. Every view follows the same document; Yinkie does not create competing
copies of your text.

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>Files that stay yours</h3>
      <p>Work with ordinary <code>.md</code> files. Your writing remains readable,
      portable and useful without Yinkie.</p>
    </td>
    <td width="50%" valign="top">
      <h3>Visual when you want it</h3>
      <p>Format headings, lists, links, tables, images, footnotes and more without
      having to think in punctuation.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>Local-first by default</h3>
      <p>No account is required for editing. Yinkie works directly with local
      documents instead of turning them into cloud-only content.</p>
    </td>
    <td width="50%" valign="top">
      <h3>A real desktop workspace</h3>
      <p>Bring together independent files and folders, keep multiple documents
      open, split the editor and search across your Markdown workspace.</p>
    </td>
  </tr>
</table>

## Edit a Markdown draft from your AI assistant

Ask your AI assistant for a plan, research summary or documentation in Markdown.
Save the result as a .md file and open it in Yinkie to read, revise and keep it
alongside your own notes. On Desktop, multiple folders and documents can share
one workspace, with tabs and two editor groups keeping references close at hand.

AI generation happens in your chosen service. Yinkie works with the Markdown
you bring into it.

## Edit source with a preview beside it

Source is never treated as a lesser mode. Yinkie is designed to preserve
Markdown it cannot safely edit visually instead of silently flattening or
discarding it. When a fragment cannot be interpreted safely, it stays visible
and points back to the exact Source that owns it.

<p align="center">
  <img src="./assets/screenshots/yinkie-source-preview-dark.webp" width="100%" alt="Mermaid sequence-diagram code in Source beside the rendered A publish request section in Preview.">
</p>

## More than a single-file editor

Yinkie Desktop is made for people whose notes, documentation and writing live
across real folders. Named workspaces can combine multiple roots and pinned
files without moving them or imposing a project structure. Quick Open and
workspace search help you move through a large collection while keeping the
current document open.

Rich technical documents belong in that same workflow. Supported diagram
fences render as bounded previews, while code remains readable and close to its
plain Markdown source.

<p align="center">
  <img src="./assets/screenshots/yinkie-split-editing-dark.webp" width="100%" alt="Two Yinkie Desktop editor groups showing a checklist, code and an API reference side by side.">
</p>

## Rich documents

Keep local images, tables, code and your notes in one portable Markdown file.

<p align="center">
  <img src="./assets/screenshots/yinkie-rich-document-dark.webp" width="100%" alt="The Attention Lab demo document with a local chart image and a table of illustrative research results.">
</p>

## Find the words you remember

Search your Desktop workspace, then use Find/Replace inside the document.

<p align="center">
  <img src="./assets/screenshots/yinkie-workspace-search-dark.webp" width="100%" alt="Yinkie Desktop workspace search results for con alongside highlighted matches and document Find/Replace in an equipment checklist.">
</p>

## Revisit a saved version

Read earlier local versions and compare them with the current file before restoring.

<p align="center">
  <img src="./assets/screenshots/yinkie-history-dark.webp" width="100%" alt="Yinkie Desktop History with three saved versions and a read-only preview of The City at Blue Hour.">
</p>

## Desktop and Web

Yinkie uses the same Markdown engine across both experiences, while staying
honest about what a browser can and cannot do.

| | Yinkie Desktop | Yinkie Web |
| --- | --- | --- |
| Visual and Source editing | Yes | Yes |
| Source with read-only Preview | Yes | Yes |
| Open and save local Markdown | Native file access | Browser-permitted file access |
| Tabs and split editor | Yes | Yes |
| Folder workspaces and workspace search | Yes | — |
| File watching and conflict handling | Yes | Limited by the browser |
| Account required | No | No |
| Document upload required | No | No |

Open the browser edition at **[yinkie.app](https://yinkie.app)**. Your Markdown
file is opened on your device; it is not uploaded merely to use the editor.

## Download

Get the newest desktop build from **[Latest Release][latest-release]**.

| Platform | What to download |
| --- | --- |
| Windows | The installer ending in `.exe` |
| macOS | The disk image ending in `.dmg` |

Each release page includes the version, attached installers, known limitations
and a readable summary of what changed.

> [!IMPORTANT]
> Early Yinkie Desktop builds may be unsigned. Windows may display a Microsoft
> Defender SmartScreen warning, and macOS may require manual approval in
> **System Settings → Privacy & Security**. Download Yinkie only from this
> repository or from links on [yinkie.com](https://yinkie.com).

## Choose Markdown that fits your other tools

Yinkie supports these document compatibility profiles:

- **Yinkie Markdown 5.0**
- **CommonMark 0.31.2**
- **GitHub Flavored Markdown (GFM) 0.29**
- **GitHub repository Markdown**, reviewed 2026-08-27, for repository .md files

Choose the profile your other editor or destination supports. Yinkie checks the
document against that profile and identifies syntax/structure outside its
contract. You can change an individual document's target or set a default for
new files. Changing the target does not silently rewrite the document.

Compatibility does not imply identical visual styling or support for every
third-party extension. The GitHub profile covers repository Markdown files,
not every GitHub surface.

## Markdown support

Yinkie is built around portable Markdown and a conservative approach to
round-trip editing.

<details>
<summary><strong>See supported content</strong></summary>

<br>

- headings, paragraphs and thematic breaks;
- bold, italic, strikethrough and inline code;
- ordered, unordered and task lists;
- links and images;
- blockquotes and fenced code blocks;
- GitHub-style tables and alerts;
- footnotes;
- reviewed safe HTML and details blocks;
- frontmatter preservation;
- Mermaid and other supported diagram fences;
- document outline, Find/Replace and spellcheck.

When a construct cannot be represented safely in Visual mode, Yinkie keeps
Source available rather than pretending the syntax does not exist.

</details>

## Privacy is part of the product

Your documents are not marketing data.

- Local editing does not require an account.
- The web editor does not need to upload your Markdown document.
- Remote content is not loaded from a document without explicit permission.
- Document text, filenames, paths and search queries do not belong in product
  analytics.

## Beta access and activation

Beta participants will be able to leave their email address and receive an
activation code for selected additional features at no charge. After beta, a base
edition will be offered, with additional features unlocked by a paid activation key.
Current prices will appear in the [Pricing section](https://yinkie.com/#pricing)
once payments are connected. The features available without payment may change
at the maintainer's discretion with each update, subject to the Terms of Use and
applicable law.

## Feedback

Public support: **[support@yinkie.com](mailto:support@yinkie.com)**.


Yinkie is growing in public, and thoughtful reports are especially valuable
during the early releases.

Before opening an issue, please check whether it has already been reported. For
a new report, include:

- your Yinkie version and operating system;
- the smallest set of steps that reproduces the problem;
- what you expected and what happened instead;
- a screenshot, when it helps explain the interface state.

Please do not attach private documents. If Markdown content is needed to
reproduce a problem, replace it with a short fictional example first.

**[Report a problem or suggest an improvement][new-issue]**

## About this repository

This is Yinkie's public distribution repository. It contains the landing page,
official release binaries, release notes and public issue tracking. The application source code
is maintained separately.

<p align="center">
  <a href="https://yinkie.com">yinkie.com</a>
  &nbsp;&middot;&nbsp;
  <a href="https://yinkie.app">yinkie.app</a>
  &nbsp;&middot;&nbsp;
  <a href="https://github.com/TrinkieYinkie/Yinkie_releases/releases">all releases</a>
</p>

<p align="center">
  <sub>Made for people who want beautiful writing tools without giving up plain text.</sub>
</p>

[latest-release]: https://github.com/TrinkieYinkie/Yinkie_releases/releases/latest
[new-issue]: https://github.com/TrinkieYinkie/Yinkie_releases/issues/new/choose

## Landing development

See [local development](docs/landing.md), the [landing plan](docs/plans/yinkie-landing.md),
and the [screenshot brief](docs/screenshots.md).

[Landing analytics](docs/landing-analytics.md) measures page views and Desktop-link
intent using only in-memory page IDs and closed source/campaign categories. It is
separate from application telemetry and download counters. Production sending
is disabled until the dedicated receiver is ready.

Current [Terms of Use](https://yinkie.com/legal/terms-v3.html) cover feature availability, local documents and user responsibilities.
