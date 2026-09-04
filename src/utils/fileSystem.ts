/**
 * Cross-platform file operations supporting both Browser (File System Access API / Blob fallback)
 * and Desktop environments.
 */

export interface OpenedFile {
  name: string;
  content: string;
  handle?: FileSystemFileHandle;
}

/**
 * Opens a Markdown form file from the local file system.
 */
export async function openMarkdownFile(): Promise<OpenedFile | null> {
  // Try modern File System Access API (supported in Chromium browsers & Electron)
  if ('showOpenFilePicker' in window) {
    try {
      // @ts-expect-error File System Access API
      const [handle]: [FileSystemFileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'Markdown Form Files',
            accept: {
              'text/markdown': ['.md', '.markdown', '.form.md'],
            },
          },
        ],
        multiple: false,
      });

      const file = await handle.getFile();
      const content = await file.text();
      return {
        name: file.name,
        content,
        handle,
      };
    } catch (err: unknown) {
      // User cancelled picker
      if ((err as Error).name === 'AbortError') return null;
      console.warn('Falling back to file input:', err);
    }
  }

  // Fallback: standard HTML5 file input
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,.form.md,text/markdown,text/plain';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const content = await file.text();
      resolve({
        name: file.name,
        content,
      });
    };

    input.click();
  });
}

/**
 * Saves a Markdown form file back to disk.
 */
export async function saveMarkdownFile(
  content: string,
  defaultName: string = 'form.form.md',
  existingHandle?: FileSystemFileHandle
): Promise<{ success: boolean; handle?: FileSystemFileHandle; filename: string }> {
  // If we already have a writable handle, save in-place!
  if (existingHandle) {
    try {
      const writable = await (existingHandle as unknown as { createWritable: () => Promise<{ write: (c: string) => Promise<void>; close: () => Promise<void> }> }).createWritable();
      await writable.write(content);
      await writable.close();
      return { success: true, handle: existingHandle, filename: defaultName };
    } catch (err) {
      console.warn('Could not write to existing handle, prompting save picker:', err);
    }
  }

  // Modern File System Access API Save Picker
  if ('showSaveFilePicker' in window) {
    try {
      // @ts-expect-error File System Access API
      const handle = await window.showSaveFilePicker({
        suggestedName: defaultName.endsWith('.md') ? defaultName : `${defaultName}.form.md`,
        types: [
          {
            description: 'Markdown Form File',
            accept: { 'text/markdown': ['.md', '.form.md'] },
          },
        ],
      });

      const writable = await (handle as unknown as { createWritable: () => Promise<{ write: (c: string) => Promise<void>; close: () => Promise<void> }> }).createWritable();
      await writable.write(content);
      await writable.close();

      return { success: true, handle, filename: defaultName };
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') {
        return { success: false, filename: defaultName };
      }
      console.warn('Falling back to browser download:', err);
    }
  }

  // Fallback: Blob download
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = defaultName.endsWith('.md') ? defaultName : `${defaultName}.form.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { success: true, filename: defaultName };
}

/**
 * Downloads arbitrary JSON data as a file.
 */
export function downloadJsonFile(data: unknown, filename: string = 'form-data.json'): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
