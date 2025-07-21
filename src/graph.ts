import type { ModuleGraph } from '@thepassle/module-graph/ModuleGraph.js';
import type { ExtendedModule, ExtendedModuleGraph } from '@thepassle/module-graph/plugins/unused-exports.js';

import { createModuleGraph as create } from '@thepassle/module-graph';
import { exports } from '@thepassle/module-graph/plugins/exports.js';
import { imports } from '@thepassle/module-graph/plugins/imports.js';
import { typescript } from '@thepassle/module-graph/plugins/typescript.js';
import { unusedExports } from '@thepassle/module-graph/plugins/unused-exports.js';
import { readdir, stat } from 'node:fs/promises';
import { parse, relative } from 'node:path';

import type { Extension, FileNode, FolderNode, ModuleData, TreeNode } from '../shared/types.js';

export const extensions: Extension[] = ['.js', '.mjs', '.ts', '.mts'];

export async function findEntryPoint() {
  return (
    await Promise.all(extensions
      .map(async (ext) => {
        const entry = `./src/index${ext}`;
        const stats = await stat(entry).catch(() => undefined);
        return stats ? entry : undefined;
      }))
  ).filter(Boolean)[0];
}

// @todo
// implement chokidar
// let cachedFt: FtDir;

const ignore: string[] = ['node_modules', 'dist'];

export async function getFiles(cwd: string, data?: ExtendedModuleGraph) {
  const id = cwd === process.cwd() ? './' : relative(process.cwd(), cwd);
  const nodes = new Map<string, TreeNode>();

  const modules = (data?.modules || new Map()) as Map<string, ExtendedModule>;

  const tree: FolderNode = {
    id,
    name: '<root>',
    parentPath: cwd,
    type: 'dir',
    children: await getChildren(id, nodes, modules),
  };

  return { tree, nodes };
}

async function getChildren(
  path: string,
  nodes: Map<string, TreeNode>,
  modules: Map<string, ExtendedModule>,
) {
  const files: Map<string, TreeNode> = new Map();
  const folders: Promise<TreeNode>[] = [];

  const items = await readdir(path, { withFileTypes: true });

  for (const item of items) {
    const { name, parentPath } = item;

    if (name[0] === '.') continue;

    const type = item.isFile() ? 'file' : 'dir';

    if (type === 'file') {
      const ext = parse(name).ext as Extension;
      const id = `${parentPath}${name}`;
      const node: FileNode = {
        id,
        name,
        parentPath,
        type,
        ext,
        data: getModuleData(id, modules),
      };

      files.set(node.id, node);
      nodes.set(node.id, node);
      continue;
    }

    if (ignore.includes(name)) continue;

    folders.push((async () => {
      const id = `${parentPath}${name}/`;
      return {
        id,
        name,
        parentPath,
        type,
        children: await getChildren(id, nodes, modules),
      };
    })());
  }

  const result: TreeNode[] = [];

  if (folders.length > 0) {
    (await Promise.all(folders))
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(folder => result.push(folder));
  }

  if (files.size > 0) {
    [...files.values()]
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(file => result.push(file));
  }

  return result;
}

// ### //

const plugins = [
  typescript(),
  imports,
  exports,
  unusedExports,
];

const cachedModuleGraph = new Map<string, ModuleGraph>();

export async function getModuleGraph(entry: string) {
  if (!cachedModuleGraph.has(entry)) {
    // const graph = (await create(entry, { plugins })) as ExtendedModuleGraph;
    const graph = (await create(entry, { plugins, external: { ignore: true } })) as ExtendedModuleGraph;
    cachedModuleGraph.set(entry, graph);
  }

  return cachedModuleGraph.get(entry)! as ExtendedModuleGraph;
}

export function getModuleData(id: string, modules: Map<string, ExtendedModule>) {
  const data = modules.get(id.slice(2));

  return data !== undefined
    ? ([
        'facade',
        'hasModuleSyntax',
        'importedBy',
        'imports',
        'exports',
      ] as (keyof ModuleData)[]).reduce((result, key) => {
        const value = (key !== 'importedBy')
          ? data[key]
          : data[key].map(i => `./${i}`);

        return {
          ...result,
          [key]: value,
        };
      }, {} as ModuleData)
    : undefined;
};
