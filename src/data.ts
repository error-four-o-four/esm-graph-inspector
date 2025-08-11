import type { FileTreeData, ModuleGraphData } from '~~/shared/types/data.js';
import type { ChangedPayload } from '~~/shared/types/payload.js';
import type { FSWatcher, FSWatcherEventMap } from 'chokidar';

import chokidar from 'chokidar';

import { createEntryPoint } from './data/entrypoint.js';
import { createFileTree, ignored } from './data/filetree.js';
import { createModuleGraph } from './data/graph.js';
import { notifyClients } from './handler/socket.js';
import { hostLogger } from './utils.js';

type UserOptions = {
  entry?: string;
};

let userEntryPoint: string;

let promisedFileTree: Promise<FileTreeData> | undefined;
let promisedEntryPoint: Promise<string | undefined> | undefined;
let promisedModuleGraph: Promise<ModuleGraphData | undefined> | undefined;

export function setUserEntryPoint(s: string) {
  promisedEntryPoint = undefined;
  userEntryPoint = s;
}

export function getPromisedFileTree() {
  // @todo error handling
  return promisedFileTree ??= createFileTree(process.cwd());
}

export function getPromisedEntryPoint() {
  // @todo error handling
  return promisedEntryPoint ??= createEntryPoint(userEntryPoint);
}

async function getPromises() {
  return await Promise.all([
    getPromisedFileTree(),
    getPromisedEntryPoint(),
  ]);
}

export async function getPromisedModuleGraph() {
  if (promisedModuleGraph) return promisedModuleGraph;

  const [tree, entry] = await getPromises();

  // @todo error handling
  return promisedModuleGraph = createModuleGraph(tree, entry);
}

let watcher: FSWatcher;

export async function initialize(options?: UserOptions) {
  if (options && options.entry) {
    setUserEntryPoint(options.entry);
  }

  createWatcher();
}

export async function createWatcher() {
  const [tree, entry] = await getPromises();

  const src = entry && tree.files[entry] ? tree.files[entry].parent.slice(0, -1) : '.';

  watcher = chokidar.watch(src, {
    ignored,
    ignoreInitial: true,
    persistent: true,
  });

  const events: (keyof FSWatcherEventMap)[] = ['add', 'change', 'unlink', 'addDir', 'unlinkDir'];

  for (const event of events) {
    const listener = (path: string) => {
      const type: ChangedPayload['type'] = (event === 'change')
        ? 'graph-change'
        : 'tree-change';

      if (type === 'graph-change') {
        promisedModuleGraph = undefined;
      } else {
        promisedFileTree = undefined;
        promisedEntryPoint = undefined;
      }

      // When a file or directory changes, notify clients
      notifyClients(type, path);
      hostLogger(event, path);
    };

    watcher.on(event, listener);
  }

  watcher.on('ready', () => {
    // hostLogger(`watching ${yellow(JSON.stringify(watcher.getWatched(), null, 2))}`);
    hostLogger(`watching`, src);
  });
}
