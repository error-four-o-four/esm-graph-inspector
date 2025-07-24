import type { ExtendedModule, ExtendedModuleGraph } from '@thepassle/module-graph/plugins/unused-exports.js';

import { createModuleGraph as create } from '@thepassle/module-graph';
import { exports } from '@thepassle/module-graph/plugins/exports.js';
import { imports } from '@thepassle/module-graph/plugins/imports.js';
import { typescript } from '@thepassle/module-graph/plugins/typescript.js';
import { unusedExports } from '@thepassle/module-graph/plugins/unused-exports.js';
import { stat } from 'node:fs/promises';

import type { ErrorPayload, GraphPayload, ModuleData, PayloadRequest } from '../../shared/types.js';

import { extensions } from '../../shared/data.js';

const plugins = [
  typescript(),
  imports,
  exports,
  unusedExports,
];

const toRelative = (s: string) => s.startsWith('./') ? s : `./${s}`;

export async function createModuleGraphPayload(
  request: PayloadRequest, // @todo
): Promise<GraphPayload | ErrorPayload> {
  // data: ExtendedModuleGraph,
  const entry = request.file || await findEntryPoint();

  if (entry === undefined) {
    return {
      type: 'warning',
      message: 'Unable to determine entry point.\nPlease select a file ...',
    };
  }

  // @todo create promise beforehand on startup
  const data = await getModuleGraph(entry);

  if (data === undefined) throw new Error('Unable to get module graph.');

  const links = Object.fromEntries(
    [...data.graph.entries()]
      .map(([id, links]) => [toRelative(id), [...links].map(l => toRelative(l))]),
  );

  return {
    type: 'graph',
    data: {
      entry,
      // entry: data.entrypoints[0],
      links,
    },
  };
}

// @todo **/app.*
// @todo find and parse index.html
async function findEntryPoint() {
  // return './app/app.vue';

  return (
    await Promise.all(extensions
      .map(async (ext) => {
        const entry = `./src/index${ext}`;
        const stats = await stat(entry).catch(() => undefined);
        return stats ? entry : undefined;
      }))
  ).filter(Boolean)[0];
}

const cachedModuleGraph = new Map<string, ExtendedModuleGraph>();

export async function getModuleGraph(entry: string) {
  if (!cachedModuleGraph.has(entry)) {
    // @todo cli option ?
    // const graph = (await create(entry, { plugins })) as ExtendedModuleGraph;
    const data = (await create(entry, { plugins, external: { ignore: true } })) as ExtendedModuleGraph;

    cachedModuleGraph.set(entry, data);
  }

  return cachedModuleGraph.get(entry);
}

export function getModuleData(id: string, modules: Map<string, ExtendedModule>) {
  const data = modules.get(id.slice(2));

  return data !== undefined
    ? ([
        'facade',
        'hasModuleSyntax',
        'importedBy',
        'imports',
        'exports',
      ] as (keyof ModuleData)[]).reduce((result, key) => {
        const value = (key !== 'importedBy')
          ? data[key]
          : data[key].map(i => `./${i}`);

        return {
          ...result,
          [key]: value,
        };
      }, {} as ModuleData)
    : undefined;
};
