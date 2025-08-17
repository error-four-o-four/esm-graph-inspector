import { readdir } from 'node:fs/promises';
import { parse } from 'node:path';

import type {
  Extension,
  FileID,
  FileTreeData,
  FolderData,
  FolderID,
} from '../../shared/types/data.js';

// @todo include gitignore
export const ignored: string[] = ['node_modules', 'coverage', 'dist'];

type AccumulatedData = Pick<FileTreeData, 'files' | 'folders' | 'levels'> & {
  index: number;
};

// @todo
// For very large file trees, this approach may be slow or memory-intensive. Consider streaming or limiting depth if needed
export async function createFileTree(cwd: string): Promise<FileTreeData> {
  const id = './';

  const data: AccumulatedData = {
    index: 0, // tree index
    files: {},
    folders: {},
    levels: [[id]],
  };

  const { fileIds, folderIds } = await walkFileTree(id, data, 0);

  const root: FolderData = {
    id,
    name: '<root>',
    parent: cwd,
    index: 0,
    level: 0,
    depth: 0,
    fileIds,
    folderIds,
  };

  data.folders[id] = root;

  const folders = Object.fromEntries(
    Object.entries(data.folders).sort((a, b) => a[1].index - b[1].index),
  );

  return {
    root,
    files: data.files,
    fileIds: Object.keys(data.files),
    folders,
    folderIds: Object.keys(folders),
    levels: data.levels,
  };
}

async function walkFileTree(
  path: string,
  data: AccumulatedData,
  prev: number,
) {
  // read currrent path
  const items = (await readdir(path, { withFileTypes: true }));

  // store current ids
  const _fileIds: FileID[] = [];
  const _folderIds: FolderID[] = [];

  for (const item of items) {
    const { name, parentPath: parent } = item;

    // skip ignored
    // @todo make this configurable if needed
    if (name[0] === '.') continue;

    if (item.isFile()) {
      const id = `${parent}${name}`;
      const ext = parse(name).ext as Extension;

      // store file id
      _fileIds.push(id);

      data.files[id] = {
        id,
        name,
        parent,
        depth: prev,
        ext,
      };
      continue;
    }

    const id = `${parent}${name}/`;

    // store folder id
    _folderIds.push(id);

    // increment index
    const index = data.index += 1;
    const depth = prev + 1;

    // ensure level
    if (!data.levels[depth]) {
      data.levels[depth] = [];
    }

    const level = data.levels[depth].length;
    data.levels[depth].push(id);

    const { fileIds, folderIds } = ignored.includes(name)
      ? { fileIds: [], folderIds: [] } // list ignored as empty folder
      : await walkFileTree(id, data, depth);

    data.folders[id] = {
      id,
      name,
      index,
      level,
      depth,
      parent,
      fileIds,
      folderIds,
    };
  }

  return { fileIds: _fileIds, folderIds: _folderIds };
}
