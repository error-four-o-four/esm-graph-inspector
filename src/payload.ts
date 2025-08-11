import type { ErrorPayload, FileTreePayload, GraphPayload } from '~~/shared/types/payload.js';

import { getPromisedFileTree, getPromisedModuleGraph } from './data.js';

// export function createErrorPayload(type: ErrorPayload['type'], errorOrMessage?: unknown): ErrorPayload {
//   const message = (errorOrMessage instanceof Error)
//     ? errorOrMessage.message
//     : (typeof errorOrMessage === 'string')
//         ? errorOrMessage
//         : 'An unexpected error occured.';

//   return {
//     type,
//     message,
//   };
// }

export async function createFileTreePayload(): Promise<FileTreePayload | ErrorPayload> {
  try {
    const data = await getPromisedFileTree();

    if (data === undefined) throw new Error('Unable to create file tree!');

    return {
      type: 'tree',
      data,
    };
  } catch (catched) {
    const error = (catched instanceof Error)
      ? catched
      : new Error('An unexpected error occurred!');

    console.warn(error);

    return {
      type: 'error',
      error,
      message: error.message,
    };
  }
}

export async function createModuleGraphPayload(): Promise<GraphPayload> {
  const data = await getPromisedModuleGraph();

  if (data === undefined) console.warn('Unable to get module graph.');

  return {
    type: 'graph',
    data,
  };
}
