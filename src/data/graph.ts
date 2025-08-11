import type { ExtendedModule, ExtendedModuleGraph } from '@thepassle/module-graph/plugins/unused-exports.js';

import { createModuleGraph as create } from '@thepassle/module-graph';
import { exports } from '@thepassle/module-graph/plugins/exports.js';
import { imports } from '@thepassle/module-graph/plugins/imports.js';
import { typescript } from '@thepassle/module-graph/plugins/typescript.js';
import { unusedExports } from '@thepassle/module-graph/plugins/unused-exports.js';

import type { FileID, FileTreeData, FolderID, ModuleData, ModuleGraphData, ModuleGraphLinkData } from '../../shared/types/data.js';

import { toRelative } from '../utils.js';

const plugins = [
  typescript(),
  imports,
  exports,
  unusedExports,
];

export async function createModuleGraph(
  { files, folders }: FileTreeData,
  entry: string | undefined,
): Promise<ModuleGraphData | undefined> {
  if (!entry) return;

  const data = (await create(entry, { plugins, external: { ignore: true } })) as ExtendedModuleGraph;

  const linkIds = Object.fromEntries(
    [...data.graph.entries()]
      .map(([id, links]) => [toRelative(id), [...links].map(l => toRelative(l))]),
  );

  const fileIds = createFileIds(linkIds);
  const folderIds = createFolderIds(linkIds, files);
  const links = createLinkData(linkIds, files, folders);

  return {
    entry,
    fileIds,
    folderIds,
    links,
    linkIds,
  };
}

function createFolderIds(
  links: ModuleGraphData['linkIds'],
  files: FileTreeData['files'],
): FolderID[] {
  const result = new Set<FolderID>();

  for (const [targetId, sources] of Object.entries(links)) {
    result.add(files[targetId].parent);
    for (const sourceId of sources) {
      result.add(files[sourceId].parent);
    }
  }

  return [...result];
}

function createFileIds(links: ModuleGraphData['linkIds']): FileID[] {
  const result = new Set<FileID>();

  for (const [targetId, source] of Object.entries(links)) {
    result.add(targetId);
    for (const sourceId of source) {
      result.add(sourceId);
    }
  }

  return [...result];
};

function createLinkData(
  links: ModuleGraphData['linkIds'],
  files: FileTreeData['files'],
  folders: FileTreeData['folders'],
) {
  const result: ModuleGraphLinkData[] = [];
  const entries = Object.entries(links);

  for (let i = 0; i < entries.length; i += 1) {
    const [targetId, sources] = entries[i];
    const targetFile = files[targetId];
    const targetFolder = folders[targetFile.parent];

    for (const sourceId of sources) {
      const sourceFile = files[sourceId];
      const sourceFolder = folders[sourceFile.parent];

      // @todo inbound outbound
      // @todo precompute bundles per level
      // @todo use separate bundle index per level
      // @todo bundle depth
      result.push({
        id: `${sourceId}|${targetId}`,
        bundle: i,
        source: {
          file: sourceFile,
          folder: sourceFolder,
        },
        target: {
          file: targetFile,
          folder: targetFolder,
        },
      });
    }
  }

  return result;
}

// @todo
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
