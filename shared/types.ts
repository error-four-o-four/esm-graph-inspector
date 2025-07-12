export type Extension = `.${string}`;

type FtBase = {
  type: 'dir' | 'file';
  parentPath: string;
};

export type FtFile = FtBase & {
  type: 'file';
  ext: Extension;
};

export type FtDir = FtBase & {
  type: 'dir';
  children: Filetree;
};

export type FtItem = FtDir | FtFile;

export type Filetree = Record<string, FtItem>;

export type PayloadFileTree = {
  type: 'filetree';
  data: Filetree;
};

export type Payload = PayloadFileTree;
