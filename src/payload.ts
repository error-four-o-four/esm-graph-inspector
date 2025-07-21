import type { Payload } from '~~/shared/types';

import { findEntryPoint, getFiles, getModuleGraph } from './graph.js';

export async function createPayload(cwd = process.cwd()): Promise<Payload> {
  const entry = await findEntryPoint();

  const graph = entry
    ? await getModuleGraph(entry)
    : undefined;

  const links = graph !== undefined
    ? Object.fromEntries(
        [...graph.graph.entries()]
          .map(([id, set]) => [`./${id}`, [...set].map(id => `./${id}`)] as [string, string[]]),
      )
    : undefined;

  const { tree, nodes: nodesMap } = await getFiles(cwd, graph);
  const nodes = Object.fromEntries(nodesMap.entries());

  return {
    tree,
    entry,
    nodes,
    links,
  };
}
