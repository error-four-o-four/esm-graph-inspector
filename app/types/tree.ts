import type { FileData, FolderData } from '~~/shared/types.js';

import type Folder from '~/components/tree/Folder.vue';
import type Layout from '~/components/tree/Layout.vue';

export type FolderInstance = InstanceType<typeof Folder>;

export type LayoutInstance = InstanceType<typeof Layout>;

export type GraphLinkData = {
  id: string;
  bundle: number;
  source: {
    file: FileData;
    folder: FolderData;
  };
  target: {
    file: FileData;
    folder: FolderData;
  };
};
