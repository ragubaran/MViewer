# Help & FAQ

## Which build should I use?
- **Web** (`bun dev`) — fastest way to try MDViewer, needs a browser with the File System Access API (Chrome/Edge).
- **Desktop** (`bun desktop`) — native window, native file dialogs, works offline.
- **Chrome Extension** — same UI as Web, but lives in your browser toolbar/side panel. Build with `bun run build:extension`, load `extension/dist` as unpacked, or install the packaged `.crx` (see README).

## Building a form template
Switch the Template Builder to **Visual Builder** mode to add sections, text, and Typeform-style fields without touching markdown. Switch to **Markdown Source** to edit the raw `.form.md` and frontmatter directly — both modes stay in sync and the split preview updates live.

## "CRITICAL INTEGRITY VIOLATION: TAMPER DETECTED"
The template body's SHA-256 checksum (stored in the YAML frontmatter) no longer matches the document content — someone edited the template text outside MDViewer. Re-open the original sealed file, or re-seal it (**Seal Template**) if the edit was intentional.

## Extracting filled form data for an LLM
Open a filled `.form.md`, use the LLM Extraction panel (`Cmd/Ctrl + E`) to copy structured JSON plus a ready-made prompt for Gemini, Claude, or ChatGPT — no OCR round-trip needed.

## Extension permissions
The extension only requests `sidePanel` and `storage` — no host permissions, no network access. It reads/writes files the same way the web app does, via the browser's File System Access API.
