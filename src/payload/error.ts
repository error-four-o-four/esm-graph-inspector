import type { ErrorPayload } from '~~/shared/types.js';

export function createErrorPayload(type: ErrorPayload['type'], errorOrMessage?: unknown): ErrorPayload {
  const message = (errorOrMessage instanceof Error)
    ? errorOrMessage.message
    : (typeof errorOrMessage === 'string')
        ? errorOrMessage
        : 'An unexpected error occured.';

  return {
    type,
    message,
  };
}
