import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const EXT_DIR = path.join(ROOT_DIR, 'extension');
const DIST_DIR = path.join(EXT_DIR, 'dist');

console.log('⚡ Building MViewer Chrome Extension with shared UI components...');

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
console.log('👉 To install in Chrome:');
console.log('   1. Navigate to chrome://extensions');
console.log('   2. Enable "Developer mode" (top right toggle)');
console.log('   3. Click "Load unpacked"');
console.log('   4. Select the directory: ' + DIST_DIR);
