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

export type ModuleGraphLinkData = {
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

export type ModuleGraphData = {
  entry: string;
  fileIds: FileID[];
  folderIds: FolderID[];
  links: ModuleGraphLinkData[];
  linkIds: Record<string, string[]>;
};
