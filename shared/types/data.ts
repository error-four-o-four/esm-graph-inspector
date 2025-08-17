import type { ExtendedModule } from '@thepassle/module-graph/plugins/unused-exports.js';

export type Extension = `.${string}`;

// ### //

type BaseData = {
  id: string;
  name: string;
  parent: string;
};

export type FileData = BaseData & {
  depth: number; // tree depth
  ext: Extension;
};

export type FileID = FileData['id'];

export type FolderData = BaseData & {
  index: number; // tree index
  level: number;
  depth: number;
  fileIds: FileID[];
  folderIds: FolderID[];
};

export type FolderID = FolderData['id'];

export type FolderLinkData = {
  id: FolderLinkID;
  initial: boolean;
  source: FolderData;
  target: FolderData;
};

export type FolderLinkID = `${FolderID}|${FolderID}`;

export type FileTreeData = {
  root: FolderData;
  files: Record<FileID, FileData>;
  fileIds: FileID[];
  folders: Record<FolderID, FolderData>;
  folderIds: FolderID[];
  folderLinks: FolderLinkData[];
  levels: FolderID[][];
};

// ###

export type ModuleData = Pick<
  ExtendedModule,
  | 'facade'
  | 'hasModuleSyntax'
  | 'importedBy'
  | 'imports'
  | 'exports'
>;

export type ModuleGraphLinkID = `${FileID}|${FileID}`;

export type ModuleGraphLinkData = {
  id: ModuleGraphLinkID;
  bundle: {
    // used to determine the color/hue
    index: number;
    // used to determine horizontal offset position between folders
    id: string;
  };
  direction: {
    x: number;
    y: number;
  };
  // used to handle special cases e.g. direction x > 1
  folderIds: FolderID[];
  height: number;
  source: {
    file: FileData;
    folder: FolderData; // @todo redundant ??
    hasInbound: boolean;
  };
  target: {
    file: FileData;
    folder: FolderData; // @todo redundant ??
    hasOutbound: boolean;
  };
};

/**
 * @property {string} entry - the entry point
 * @property {Record<FileID, FileID[]>} mappedFileIds - used to create linkIds, bundles etc.
 * @property {FolderID[]} folderIds - used to expand folders of the file tree
 * @property {ModuleGraphLinkData[]} links - the data
 * @property {string[][]} levels - used to calculate horizontal spacing between folders
 */
export type ModuleGraphData = {
  entry: string;
  // mappedFileIds: Record<FileID, FileID[]>; // @todo redundant ??
  folderIds: FolderID[];
  links: ModuleGraphLinkData[];
  levels: string[][];
};
