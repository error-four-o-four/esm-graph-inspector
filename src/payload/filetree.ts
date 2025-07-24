import { readdir } from 'node:fs/promises';
import { parse } from 'node:path';

import type {
  ErrorPayload,
  Extension,
  FileID,
  FileTreeData,
  FileTreePayload,
  FolderData,
  FolderID,
  FolderLinkData,
  FolderLinkID,
} from '../../shared/types.js';

// @todo
// implement chokidar/watcher

// @todo
// For very large file trees, this approach may be slow or memory-intensive. Consider streaming or limiting depth if needed

const cachedFiletree: Map<string, FileTreePayload['data']> = new Map();

// @todo include gitignore
const ignore: string[] = ['node_modules', 'coverage', 'dist'];

export async function createFiletreePayload(): Promise<FileTreePayload | ErrorPayload> {
  const cwd = process.cwd();

  try {
    if (!cachedFiletree.has(cwd)) {
      cachedFiletree.set(cwd, await createFiletree(cwd));
    }

    const filetree = cachedFiletree.get(cwd);

    if (filetree === undefined) throw new Error('Unable to create filetree!');

    return {
      type: 'filetree',
      data: filetree,
    };
  } catch (catched) {
    const error = (catched instanceof Error)
      ? catched
      : new Error('An unexpected error occurred!');

    console.warn(error);

    return {
      type: 'error',
      error,
      message: error.message,
    };
  }
}

type AccumulatedData = Pick<FileTreeData, 'files' | 'folders' | 'levels'> & {
  index: number;
};

async function createFiletree(cwd: string): Promise<FileTreeData> {
  const id = './';

  const data: AccumulatedData = {
    index: 0, // tree index
    files: {},
    folders: {},
    levels: [[id]],
  };

  const { fileIds, folderIds } = await walkFiletree(id, data, 0);

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

  const folderLinks: FolderLinkData[] = Object.values(folders)
    .map((folder) => {
      const sourceId = folder.id;

      return folder.folderIds.map((targetId, index) => {
        const id: FolderLinkID = `${sourceId}|${targetId}`;
        const initial = index === 0;
        // prevent overlapping lines
        const source = index === 0 ? folder : folders[folder.folderIds[index - 1]];
        const target = folders[targetId];

        return {
          id,
          initial,
          source,
          target,
        };
      });
    })
    .flat();

  return {
    root,
    files: data.files,
    fileIds: Object.keys(data.files),
    folders,
    folderIds: Object.keys(folders),
    folderLinks,
    levels: data.levels,
  };
}

async function walkFiletree(
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

    const { fileIds, folderIds } = ignore.includes(name)
      ? { fileIds: [], folderIds: [] } // list ignored as empty folder
      : await walkFiletree(id, data, depth);

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
