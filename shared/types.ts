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

// ###

export type ModuleData = Pick<
  ExtendedModule,
  | 'facade'
  | 'hasModuleSyntax'
  | 'importedBy'
  | 'imports'
  | 'exports'
>;

// ### send from server ### //

export type FileTreeData = {
  root: FolderData;
  files: Record<FileID, FileData>;
  fileIds: FileID[];
  folders: Record<FolderID, FolderData>;
  folderIds: FolderID[];
  folderLinks: FolderLinkData[];
  levels: FolderID[][];
};

export type FileTreePayload = {
  type: 'filetree';
  data: FileTreeData;
};

export type GraphData = {
  entry: string;
  links: Record<string, string[]>;
};

export type GraphPayload = {
  type: 'graph';
  data: GraphData;
};

export type ErrorPayload = {
  type: 'error' | 'warning';
  error?: unknown;
  message: string;
};

export type Payload = ErrorPayload | FileTreePayload | GraphPayload;

// ### send from peer ### //

export type FileTreeDataRequest = {
  type: 'tree';
};

export type GraphDataRequest = {
  type: 'graph';
  file?: string;
};

export type PayloadRequest = FileTreeDataRequest | GraphDataRequest;
