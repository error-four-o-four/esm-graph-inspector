import { createModuleGraph as create } from '@thepassle/module-graph';
import { exports } from '@thepassle/module-graph/plugins/exports.js';
import { imports } from '@thepassle/module-graph/plugins/imports.js';
import { typescript } from '@thepassle/module-graph/plugins/typescript.js';
import { unusedExports } from '@thepassle/module-graph/plugins/unused-exports.js';

const plugins = [
  typescript(),
  imports,
  exports,
  unusedExports,
];

export async function createModuleGraph(entry: string) {
  return await create(entry, { plugins });
}
