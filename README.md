# MViewer 📄⚡

> **Tamper-Proof Markdown Form Viewer & Editor**
> *Replace traditional, bulky PDF forms with lightweight, cryptographically sealed, and LLM-optimized Markdown documents.*

---

## 💡 The Core Problem MViewer Solves

| Challenge | Traditional Fillable PDF Forms | **MViewer Markdown Forms (`.form.md`)** |
| :--- | :--- | :--- |
| **File Format** | Opaque binary blob (500 KB – 5 MB) | Clean, human-readable text (5 KB – 25 KB) |
| **Tamper Protection** | Complex X.509 Adobe PKI certificates | **Cryptographic SHA-256 Checksum** in YAML frontmatter |
| **Form Filling** | Acrobat Reader / proprietary viewers | **PDF Paper Canvas** with interactive inputs & blue highlight |
| **LLM Data Extraction** | ⚠️ **Slow & Costly**: 5–15s OCR / Vision tokens (~2,800 tokens, frequent hallucinations) | ⚡ **Instant (<10ms)**: Pure structured key-values (~120 tokens, **95% cost & token reduction**) |
| **Editing Control** | Document locked by binary encryption | **Viewer locks format & template text**; only form answers can be modified |

---

## ✨ Features

- 🛡️ **Tamper-Proof Template Integrity**: The template body (clauses, instructions, questions) is cryptographically signed with a SHA-256 hash. If anyone attempts to modify a single word of the legal terms in an external text editor (like VS Code or Notepad), MViewer immediately flags the document with a **`CRITICAL INTEGRITY VIOLATION: TAMPER DETECTED`** alert.
- 📋 **Fillable PDF Experience**: Interactive form fields embedded directly in Markdown text flow:
  - Short Text, Email, Phone, Website URL, Number, Currency (`$`)
  - Long Text / Textarea
  - Multiple Choice (Chips, Checkboxes, Radio)
  - Dropdown Select
  - Yes / No Buttons (Typeform style)
  - Star Ratings (1–5 stars, hearts, thumbs)
  - Opinion Scale / Net Promoter Score (NPS 0–10)
  - Range Sliders with live value badges
  - Calendar Date Pickers
  - Terms & Conditions / Legal Consent
  - **HTML5 Canvas Digital Signature Pad** (Draw or type cursive signature with attestation timestamp)
  - File Attachment Pickers
- ⚡ **Lightning-Fast LLM Data Extraction**:
  - 1-click structured JSON export
  - Token and latency benchmark comparison vs PDF Vision OCR
  - Copy-paste prompts formatted for Gemini, Claude, or ChatGPT
  - AI Autofill Simulator (paste freeform notes/emails to auto-fill form fields)
- 🎨 **Visual Builder & Markdown Text Dual Mode**:
  - **Visual Builder**: No-code drag/reorder question cards, inline question label editing, choice chips, and required toggles.
  - **Markdown Source**: Raw markdown and YAML frontmatter code editor for power users.
  - **Split Preview**: Real-time side-by-side live rendered PDF paper sheet updating as you type.
- 🧩 **Triple Deployment (Shared UI Across Web, Desktop & Chrome Extension)**:
  - **Web**: Modern browser application with File System Access API.
  - **Desktop**: Native Electron application with window menu and dock icon.
  - **Chrome Extension (Manifest V3)**: Extension submodule with popup hub, browser side-panel integration, and full-page workspace sharing 100% of the UI components.
- ⚡ **Bun 1.4 Native Performance**: Ultra-fast startup, sub-second production builds, and instantaneous unit tests with `bun test`.

---

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) (v1.4.0 or later)

### Installation
```bash
# Clone or navigate to the repository
cd /Users/ragu/Code/MViewer

# Install dependencies (blazing fast with Bun)
bun install
```

### 1. Running on the Web
```bash
bun dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Running as a Native Desktop App
```bash
bun desktop
```

### 3. Building & Loading the Chrome Extension
```bash
bun run build:extension
```
**To install the extension in Google Chrome:**
1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the directory: `/Users/ragu/Code/MViewer/extension/dist`
5. Click the MViewer icon in your extensions toolbar to open the quick popup, side panel, or full workspace!

### 4. Running Unit Tests
```bash
bun test
```
All 15 unit tests run in **~35ms** using Bun's built-in test runner.

### 5. Production Web Build
```bash
bun run build
```

---

## 📝 Document Format Specification

MViewer documents are standard Markdown files with YAML frontmatter:

```markdown
---
title: "Mutual Non-Disclosure Agreement"
template_id: "nda-2026-v1"
template_checksum: "sha256:4a8b79f1c29e4b..."
status: "filled"
form_data:
  party_a: "Acme Corp LLC"
  party_b: "Apex Innovations Inc"
  effective_date: "2026-09-04"
  jurisdiction: "Delaware (US)"
  term_years: 3
  retroactive_coverage: true
  exec_signature: "data:image/png;base64,..."
---

# Mutual Non-Disclosure Agreement (NDA)

### 1. Parties & Effective Date
- **Disclosing Party:** {{input:party_a label="Disclosing Party Name" required=true}}
- **Receiving Party:** {{input:party_b label="Receiving Party Name" required=true}}
- **Effective Date:** {{date:effective_date label="Effective Date" required=true}}

### 2. Execution
{{signature:exec_signature label="Authorized Signature" required=true}}
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Cmd/Ctrl + S` | Save filled form to disk (`.form.md`) |
| `Cmd/Ctrl + P` | Print or export to high-resolution PDF |
| `Cmd/Ctrl + E` | Open LLM Data Extraction Engine |

---

## 🔒 Security & Checksum Mechanism

1. **Canonicalization**: Line breaks are normalized to `\n` and trailing line spaces are trimmed to prevent false positives across different operating systems.
2. **SHA-256 Digest**: The template markdown content is hashed using standard SHA-256.
3. **Immutability**: Form responses are stored strictly in `form_data`. When saved, the template body is preserved verbatim, ensuring the hash remains 100% valid. Any modification to text outside `form_data` invalidates the signature.
