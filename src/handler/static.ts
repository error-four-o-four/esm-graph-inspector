import type { ServeStaticOptions } from 'h3';

import { defineEventHandler, serveStatic } from 'h3';
import { lookup } from 'mrmime';
import { readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

type MetaCache = {
  type: string | undefined;
  mtime: number;
  size: number;
};

const metaCache = new Map<string, MetaCache | undefined>();

async function readMetaCache(id: string) {
  if (!metaCache.has(id)) {
    const stats = await stat(id).catch(() => undefined);

    const meta = (!stats?.isFile())
      ? undefined
      : {
          type: lookup(id),
          mtime: stats.mtimeMs,
          size: stats.size,
        };

    metaCache.set(id, meta);
  }

  return metaCache.get(id);
}

const contentCache = new Map<string, Promise<string | undefined>>();

function readContentCache(id: string) {
  if (!contentCache.has(id)) {
    contentCache.set(id, readFile(id, 'utf-8').catch(() => undefined));
  }

  return contentCache.get(id);
}

const dir = resolve('./dist/app/public');

const options: ServeStaticOptions = {
  fallthrough: true,
  getMeta: async (id) => {
    const path = join(dir, id);
    return readMetaCache(path);
  },
  getContents: async (id) => {
    const path = join(dir, id);
    return readContentCache(path);
  },
};

export default defineEventHandler(event => serveStatic(event, options));
