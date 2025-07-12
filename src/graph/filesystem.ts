import { readdir } from 'node:fs/promises';
import { parse } from 'node:path';

import type { Extension, Filetree, FtDir, FtFile } from '../../shared/types.js';

const extensions: Extension[] = ['.js', '.ts', '.vue'];
const ignored: string[] = ['node_modules', 'dist'];

export async function createFileTree(base = './'): Promise<Filetree> {
  const files = new Map<string, FtFile>();
  const dirs: Promise<[string, FtDir]>[] = [];

  const items = await readdir(base, { withFileTypes: true });

  for (const item of items) {
    const { name, parentPath } = item;

    if (name[0] === '.')
      continue;

    if (item.isFile()) {
      const ext = parse(name).ext as Extension;

      if (!extensions.includes(ext))
        continue;

      files.set(name, {
        type: 'file',
        parentPath,
        ext,
      });

      continue;
    }

    if (ignored.includes(item.name))
      continue;

    dirs.push((async () => [
      name,
      {
        type: 'dir',
        parentPath,
        children: await createFileTree(`${parentPath}${name}/`),
      },
    ])());
  }

  let result: Filetree = {};

  if (dirs.length > 0) {
    const resolved = await Promise.all(dirs);
    result = Object.assign(result, Object.fromEntries(resolved));
  }

  if (files.size > 0) {
    result = Object.assign(result, Object.fromEntries(files.entries()));
  }

  return result;
}
