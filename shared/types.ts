import type { ExtendedModule } from '@thepassle/module-graph/plugins/unused-exports.js';

export type Extension = `.${string}`;

type BaseNode = {
  id: string;
  name: string;
  parentPath: string;
};

export type FileNode = BaseNode & {
  type: 'file';
  ext: string;
  data?: ModuleData;
};

export type FolderNode = BaseNode & {
  type: 'dir';
  children: TreeNode[];
};

export type TreeNode = FileNode | FolderNode;

export type ModuleData = Pick<
  ExtendedModule,
  | 'facade'
  | 'hasModuleSyntax'
  | 'importedBy'
  | 'imports'
  | 'exports'
>;

// ### //

export type Payload = {
  tree: TreeNode;
  entry?: string;
  nodes: Record<string, TreeNode>;
  links?: Record<string, string[]>;

};
