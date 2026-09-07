# Changelog

## v0.1.0 — 2026-09-07

First tagged release. Ships web, desktop, and Chrome extension builds from one shared UI.

- **Visual Builder & Markdown dual mode** in the Template Builder, with live split PDF-paper preview.
- **Chrome Extension (Manifest V3)**: popup hub, side-panel, and full-tab workspace, sharing 100% of the UI components with Web and Desktop.
- **Tamper-proof templates**: SHA-256 sealing with tamper detection on any out-of-band edit.
- **LLM data extraction**: structured JSON export, ~95% fewer tokens than PDF/Vision OCR.
- Desktop app: dock/window icon set from `public/icon.png`.
- Printed/exported PDF now defaults to a 50mm page margin, adjustable from the toolbar (10–60mm).
- `bun run build:extension` now also packages a signed `extension/dist/mdviewer.crx`, reusing `extension/mdviewer.pem` across builds so the extension ID stays stable.
- Added `LICENSE` (AGPL-3.0) covering the web app, desktop build, and extension.
- Fixed: duplicating a field block in the Visual Builder could produce two fields sharing the same `id`, corrupting `form_data`. Duplicate IDs are now randomized.
