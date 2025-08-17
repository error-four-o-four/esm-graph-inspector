import type { ExtendedModule, ExtendedModuleGraph } from '@thepassle/module-graph/plugins/unused-exports.js';

import { createModuleGraph as create } from '@thepassle/module-graph';
import { exports } from '@thepassle/module-graph/plugins/exports.js';
import { imports } from '@thepassle/module-graph/plugins/imports.js';
import { typescript } from '@thepassle/module-graph/plugins/typescript.js';
import { unusedExports } from '@thepassle/module-graph/plugins/unused-exports.js';

import type { FileID, FileTreeData, FolderID, ModuleData, ModuleGraphData, ModuleGraphLinkData, ModuleGraphLinkID } from '../../shared/types/data.js';

import { toRelative } from '../utils.js';

const plugins = [
  typescript(),
  imports,
  exports,
  unusedExports,
];

export async function createModuleGraph(
  tree: FileTreeData,
  entry: string | undefined,
): Promise<ModuleGraphData | undefined> {
  if (!entry) return;

  const data = (await create(entry, { plugins, external: { ignore: true } })) as ExtendedModuleGraph;

  const fileIds = createFileIds(data);
  const folderIds = createFolderIds(tree, fileIds);
  const { links, levels } = createLinkData(tree, fileIds);

  return {
    entry,
    // mappedFileIds: fileIds.mapped,
    folderIds,
    links,
    levels,
    // modules // @todo
  };
}

function createFileIds({ graph }: ExtendedModuleGraph) {
  const entries: [FileID, FileID[]][] = [...graph.entries()]
    .map(([id, links]) => [
      toRelative(id),
      [...links].map(l => toRelative(l)),
    ]);

  const mapped = Object.fromEntries(entries);
  const source = new Set(Object.values(mapped).flat());
  const target = new Set(Object.keys(mapped));

  return {
    entries,
    mapped,
    source,
    target,
  };
}

function createFolderIds(
  { files }: FileTreeData,
  fileIds: ReturnType<typeof createFileIds>,
): FolderID[] {
  const result = new Set<FolderID>();

  for (const [targetId, sources] of fileIds.entries) {
    result.add(files[targetId].parent);
    for (const sourceId of sources) {
      result.add(files[sourceId].parent);
    }
  }

  return [...result];
}

function createLinkData(
  tree: FileTreeData,
  fileIds: ReturnType<typeof createFileIds>,
) {
  const links: ModuleGraphLinkData[] = [];
  const levels: Set<string>[] = Array.from({ length: tree.levels.length }, () => new Set());

  for (let i = 0; i < fileIds.entries.length; i += 1) {
    const [targetId, sources] = fileIds.entries[i];
    const targetFile = tree.files[targetId];
    const targetFolder = tree.folders[targetFile.parent];

    for (const sourceId of sources) {
      const sourceFile = tree.files[sourceId];
      const sourceFolder = tree.folders[sourceFile.parent];

      const id: ModuleGraphLinkID = `${sourceId}|${targetId}`;

      // depth delta x
      const directionX = targetFolder.depth - sourceFolder.depth;
      // index delta y
      const directionY = targetFolder.index - sourceFolder.index;
      const height = Math.abs(directionX);

      const folderIds: FolderID[] = [sourceFolder.id];

      if ((height === 0 && directionY !== 0) || height === 1) {
        // it's not the same folder or
        // there's only one level inbetween
        folderIds.push(targetFolder.id);
      } else if (height > 1) {
        // special case
        // ~~either avoid overlapping offsetY of folders or~~
        // search for the next folder in direction Y of target folder
        // @todo refactor
        if (directionX > 0) {
          for (let j = sourceFolder.depth + 1; j < targetFolder.depth; j += 1) {
            const nextFolder = Object.values(tree.folders)
              .filter(folder => folder.depth === j)
              .find(folder => directionY > 0
                ? folder.index > sourceFolder.index
                : folder.index < sourceFolder.index,
              );
            if (nextFolder) {
              folderIds.push(nextFolder.id);
            } else {
              console.warn('Oh no', id, directionX, directionY, i, j);
            }
          }
        } else {
          for (let j = sourceFolder.depth - 1; j > targetFolder.depth; j -= 1) {
            const nextFolder = Object.values(tree.folders)
              .filter(folder => folder.depth === j)
              .find(folder => directionY > 0
                ? folder.index > sourceFolder.index
                : folder.index < sourceFolder.index,
              );
            if (nextFolder) {
              folderIds.push(nextFolder.id);
            } else {
              console.warn('Oh no', id, directionX, directionY, i, j);
            }
          }
        }
        folderIds.push(targetFolder.id);
      }

      const bundleId = `bundle-${i}`;

      // @todo refactor
      folderIds.forEach((folderId) => {
        const folder = tree.folders[folderId];
        if (folder) {
          levels[folder.depth].add(bundleId);
        }
      });

      // @todo inbound outbound
      // @todo precompute bundles per level
      // @todo use separate bundle index per level
      // @todo bundle depth
      links.push({
        id,
        bundle: {
          index: i,
          id: bundleId,
        },
        direction: {
          x: directionX,
          y: directionY,
        },
        folderIds,
        height,
        source: {
          file: sourceFile,
          folder: sourceFolder,
          hasInbound: fileIds.target.has(sourceFile.id),
        },
        target: {
          file: targetFile,
          folder: targetFolder,
          hasOutbound: fileIds.source.has(targetFile.id),
        },
      });
    }
  }

  return {
    links,
    levels: levels.map(level => [...level]),
  };
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
