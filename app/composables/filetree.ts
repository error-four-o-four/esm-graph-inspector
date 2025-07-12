import type { TreeItem } from '@nuxt/ui';
import type { Extension, Filetree } from '~~/shared/types.js';

type TreeItemBase = TreeItem & {
  label: string;
  value: string;
};

type TreeItemDir = TreeItemBase & {
  type: 'dir';
  children: LabeledTreeItem[];
};

type TreeItemFile = TreeItemBase & {
  type: 'file';
  icon: string;
  ext: Extension;
};

export type LabeledTreeItem = TreeItemDir | TreeItemFile;

export const fileTreeArray = ref<LabeledTreeItem[]>([]);

export const selectedTreeItem = ref<LabeledTreeItem>();

export function parseFileTreeData(data: Filetree) {
  fileTreeArray.value = fileTreeToArray(data);
}

function fileTreeToArray(data: Filetree): LabeledTreeItem[] {
  return Object.keys(data).map((label) => {
    const { type, parentPath } = data[label];
    const value = `${parentPath}${label}`;

    if (type === 'file') {
      return {
        label,
        value,
        type,
        icon: 'tabler:file',
        ext: data[label].ext,
      };
    }

    const children = fileTreeToArray(data[label].children);
    return {
      // label: `${label}/`,
      label,
      value,
      type,
      icon: children.length === 0
        ? 'tabler:folder'
        : undefined,
      defaultExpanded: label === 'src',
      children,
    };
  });
}
