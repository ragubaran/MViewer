import { execSync, execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const EXT_DIR = path.join(ROOT_DIR, 'extension');
const DIST_DIR = path.join(EXT_DIR, 'dist');

console.log('⚡ Building MDViewer Chrome Extension with shared UI components...');

// 1. Build Vite application with relative base path for Chrome extension
execSync(`bun run vite build --outDir extension/dist --base ./`, {
  cwd: ROOT_DIR,
  stdio: 'inherit',
});

// 2. Copy extension manifest, background service worker, popup and icons
console.log('📦 Copying Chrome Extension Manifest V3 files...');

fs.copyFileSync(
  path.join(EXT_DIR, 'manifest.json'),
  path.join(DIST_DIR, 'manifest.json')
);

fs.copyFileSync(
  path.join(EXT_DIR, 'background.js'),
  path.join(DIST_DIR, 'background.js')
);

fs.copyFileSync(
  path.join(EXT_DIR, 'popup.html'),
  path.join(DIST_DIR, 'popup.html')
);

fs.copyFileSync(
  path.join(EXT_DIR, 'popup.js'),
  path.join(DIST_DIR, 'popup.js')
);

// Copy icons directory
const targetIconsDir = path.join(DIST_DIR, 'icons');
if (!fs.existsSync(targetIconsDir)) {
  fs.mkdirSync(targetIconsDir, { recursive: true });
}

const sourceIcons = fs.readdirSync(path.join(EXT_DIR, 'icons'));
for (const icon of sourceIcons) {
  fs.copyFileSync(
    path.join(EXT_DIR, 'icons', icon),
    path.join(targetIconsDir, icon)
  );
}

console.log('✅ Chrome Extension build complete in: extension/dist/');

// 3. Package a signed, distributable .crx using Chrome's built-in packer
const pemPath = path.join(EXT_DIR, 'mdviewer.pem');
const chromeCandidates = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];
const chromeBin = chromeCandidates.find((p) => fs.existsSync(p));

if (chromeBin) {
  console.log('🔏 Packaging signed .crx...');
  const packArgs = ['--headless', `--pack-extension=${DIST_DIR}`];
  if (fs.existsSync(pemPath)) packArgs.push(`--pack-extension-key=${pemPath}`);
  execFileSync(chromeBin, packArgs, { stdio: 'inherit' });

  // Chrome writes the package next to its target: extension/dist.crx (+ dist.pem on first run)
  const producedCrx = path.join(EXT_DIR, 'dist.crx');
  const producedPem = path.join(EXT_DIR, 'dist.pem');
  if (fs.existsSync(producedCrx)) fs.renameSync(producedCrx, path.join(DIST_DIR, 'mdviewer.crx'));
  if (fs.existsSync(producedPem)) fs.renameSync(producedPem, pemPath);

  console.log('✅ Packaged: extension/dist/mdviewer.crx');
  if (fs.existsSync(pemPath)) {
    console.log('🔑 Signed with extension/mdviewer.pem — keep this file to sign future updates with the same extension ID.');
  }
} else {
  console.log('⚠️  Chrome not found on this machine — skipped .crx packaging. Load extension/dist unpacked instead, or install Chrome and re-run.');
}

console.log('👉 To install unpacked in Chrome:');
console.log('   1. Navigate to chrome://extensions');
console.log('   2. Enable "Developer mode" (top right toggle)');
console.log('   3. Click "Load unpacked"');
console.log('   4. Select the directory: ' + DIST_DIR);
