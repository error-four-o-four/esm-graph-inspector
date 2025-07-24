import type {
  ErrorPayload,
  FileID,
  FileTreeData,
  FolderID,
  GraphData,
} from '~~/shared/types.js';

import { shallowRef, watch } from 'vue';

import type { GraphLinkData } from '~/types/tree';

import { usePayload } from '~/composables/usePayload.js';

const { payload } = usePayload();

export const errorData = shallowRef<ErrorPayload>();

export const filetreeData = shallowRef<FileTreeData>();

export const graphData = shallowRef<GraphData>();

// @todo => precompute server side
export const graphFolderIds = shallowRef<Set<FolderID>>(new Set());
export const graphFileIds = shallowRef<Set<FileID>>(new Set());
export const graphLinkData = shallowRef<GraphLinkData[]>([]);

watch(payload, (value) => {
  // console.log('watching payload');
  // console.log(value);

  if (value && value.type === 'filetree') {
    filetreeData.value = value.data;
    return;
  }

  if (value && value.type === 'graph') {
    graphData.value = value.data;

    // @todo
    if (!filetreeData.value) throw new Error('Nope app/state/data.ts');

    const { files, folders } = filetreeData.value;
    const { links } = graphData.value;

    graphFolderIds.value = createGraphFolderIds(files, links);
    graphFileIds.value = createGraphFileIds(links);
    graphLinkData.value = createGraphLinkData(files, folders, links);
    // @todo clear/set opened folder ids
    return;
  }

  if (value && (value.type === 'error' || value.type === 'warning')) {
    errorData.value = value;
  }
}, { immediate: true });

// @todo => server src/payload/graph.ts
function createGraphFolderIds(
  files: FileTreeData['files'],
  links: GraphData['links'],
) {
  const result = new Set<FolderID>();

  for (const [targetId, sources] of Object.entries(links)) {
    result.add(files[targetId].parent);
    for (const sourceId of sources) {
      result.add(files[sourceId].parent);
    }
  }

  return result;
}

function createGraphFileIds(links: GraphData['links']) {
  const result = new Set<FileID>();

  for (const [targetId, source] of Object.entries(links)) {
    result.add(targetId);
    for (const sourceId of source) {
      result.add(sourceId);
    }
  }

  return result;
};

function createGraphLinkData(
  files: FileTreeData['files'],
  folders: FileTreeData['folders'],
  links: GraphData['links'],
) {
  const result: GraphLinkData[] = [];
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
