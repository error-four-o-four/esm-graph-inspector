import type { FileTreeData, ModuleGraphData } from './data';

export type GraphPayload = {
  type: 'graph';
  data?: ModuleGraphData;
};

export type ErrorPayload = {
  type: 'error' | 'warning';
  error?: unknown;
  message: string;
};

export type FileTreePayload = {
  type: 'tree';
  data: FileTreeData;
};

export type ChangedPayload = {
  type: 'tree-change' | 'graph-change';
  data: {
    path: string;
  };
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

// ###

export type GenericPayload<K extends Payload['type'] = Payload['type']> = Extract<Payload, { type: K }>;
export type GenericPayloadRequest<K extends PayloadRequest['type'] = PayloadRequest['type']> = Extract<PayloadRequest, { type: K }>;
