import type { ChangedData, FileTreeData, ModuleGraphData } from './data';

export type ErrorPayload = {
  type: 'error' | 'warning';
  error?: unknown;
  message: string;
};

export type FileTreePayload = {
  type: 'tree';
  data: FileTreeData;
};

export type GraphPayload = {
  type: 'graph';
  data?: ModuleGraphData;
};

export type ChangedPayload = {
  type: 'tree-change' | 'graph-change';
  data: ChangedData;
};

export type Payload = ErrorPayload | FileTreePayload | GraphPayload | ChangedPayload;

// ### send from peer ### //

export type FileTreeDataRequest = {
  type: 'tree';
};

export type GraphDataRequest = {
  type: 'graph';
  file?: string;
};

export type PayloadRequest = FileTreeDataRequest | GraphDataRequest;
