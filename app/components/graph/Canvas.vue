<script setup lang="ts">
import type { FileNode, FolderNode, Payload, TreeNode } from '~~/shared/types.js';
import type { HierarchyPointNode } from 'd3-hierarchy';

import { GraphFileNode, GraphFolderNode } from '#components';
import { hierarchy, tree } from 'd3-hierarchy';
import { nextTick, onMounted, ref, shallowReactive, shallowRef } from 'vue';

const { payload } = defineProps<{
  payload: Payload;
}>();

const width = ref(window.innerWidth);
const height = ref(window.innerHeight);

// example
// https://observablehq.com/@d3/hierarchical-edge-bundling
// https://observablehq.com/@d3/collapsible-tree
// https://observablehq.com/@d3/indented-tree

const foldersMap = shallowReactive(new Map<string, HierarchyPointNode<FolderNode>>());
const filesMap = shallowReactive(new Map<string, HierarchyPointNode<FileNode>>());
const othersMap = shallowReactive(new Map<string, HierarchyPointNode<FileNode>>());

const linksMap = shallowRef<Map<TreeNodeLink['id'], TreeNodeLink>>();

const nodes = shallowRef<HierarchyPointNode<TreeNode>[]>([]);
const nodesRefMap = shallowReactive(new Map<string, HTMLDivElement>());

type TreeNodeLink = {
  id: `${string}|${string}`;
  bundle: number;
  source: TreeNodeLinkCoord;
  target: TreeNodeLinkCoord;
};

type TreeNodeLinkCoord = {
  x: number;
  y: number;
};

const nodeWidth = 320;
const nodeHeight = 48;

const offsetX = 48;

const paddingX = 48;
const paddingY = 48;

function createGraph() {
  width.value = window.innerWidth;
  height.value = window.innerHeight;

  foldersMap.clear();
  filesMap.clear();

  nodes.value = [];
  nodesRefMap.clear();

  const root = hierarchy<TreeNode>(payload.tree);
  const layout = tree<TreeNode>()(root);

  // vertical offset
  let i = 0;
  let j = 0;

  let maxX = -Infinity;
  let maxY = -Infinity;

  layout.eachBefore((node) => {
    if (!node.parent) {
      node.x = paddingX;
      node.y = paddingY;
      return;
    }

    if (!node.parent.children) return;

    node.x = paddingX + node.parent.depth * offsetX;
    node.y = paddingY + i * nodeHeight + 0.25 * j * nodeHeight;

    if (node.x > maxX) maxX = node.x;

    if (node.y > maxY) maxY = node.y;

    i += 1;

    const { id, type } = node.data;

    if (type === 'file') {
      if (node.parent.children.indexOf(node) === node.parent.children.length - 1) {
        // node is last file
        // add spacing between
        j += 1;
      }

      if (node.data.data) {
        filesMap.set(id, node as HierarchyPointNode<FileNode>);
      } else {
        othersMap.set(id, node as HierarchyPointNode<FileNode>);
      }
    } else {
      // folders.value.push(node);
      foldersMap.set(id, node as HierarchyPointNode<FolderNode>);
    }

    // nodes.value.push(node);
    // nodesMap.set(node.data.id, node);
  });

  nextTick(() => {
    width.value = maxX + 1.75 * paddingX + nodeWidth;
    height.value = maxY + 2 * paddingY;

    linksMap.value = createLinks(payload.links);

    if (payload.entry) {
      const entry = nodesRefMap.get(payload.entry);
      entry?.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

function createLinks(data: Payload['links']) {
  if (!data) return;

  const result: Map<TreeNodeLink['id'], TreeNodeLink> = new Map();

  const bundles = createBundles(data);
  const anchors = createAnchors(bundles);

  let bundleIndex = 0;

  for (const id of Object.keys(data)) {
    const bundle = bundles[id];

    for (const from of bundle.from) {
      const linkId: TreeNodeLink['id'] = `${from}|${bundle.id}`;

      if (result.has(linkId)) {
        console.log('skipped from', linkId);
        continue;
      }

      const fromAnchorIndex = bundles[from].all.indexOf(bundle.id);
      const fromAnchor = anchors[from][fromAnchorIndex];

      const toAnchorIndex = bundle.all.indexOf(from);
      const toAnchor = anchors[bundle.id][toAnchorIndex];

      result.set(linkId, {
        id: linkId,
        // bundle: linksMap.size,
        bundle: bundleIndex,
        source: fromAnchor,
        target: toAnchor,
      });
    }

    bundleIndex += 1;
  }

  return result;
}

type Bundle = {
  id: string;
  from: string[];
  to: string[];
  all: string[];
};

function createBundles(data: NonNullable<Payload['links']>): Record<string, Bundle> {
  const result: Map<string, { from: Set<string>; to: Set<string> }> = new Map();
  const get = (id: string) => result.get(id) || { from: new Set(), to: new Set() };

  for (const [importer, imports] of Object.entries(data)) {
    const bundle = get(importer);

    imports.forEach((i) => {
      bundle.from.add(i);

      const b = get(i);
      b.to.add(importer);
      result.set(i, b);
    });

    result.set(importer, bundle);
  }

  return Object.fromEntries(
    [...result.entries()].map(([id, bundle]) => {
      const from = [...bundle.from];
      const to = [...bundle.to];

      return [
        id,
        {
          id,
          from,
          to,
          all: [...from, ...to],
        },
      ];
    }),
  );
}

function createAnchors(data: Record<string, Bundle>): Record<string, TreeNodeLinkCoord[]> {
  const entries = Object.entries(data)
    .map(([id, bundle]) => {
      const nodeRef = nodesRefMap.get(id);

      if (!nodeRef) {
        // make ts happy
        return undefined;
      }

      const length = bundle.all.length;
      const rect = nodeRef.getBoundingClientRect();

      const anchorX = rect.right + 12;
      const anchorDeltaY = 8;
      const anchorsHeight = length * anchorDeltaY;

      // @todo
      const anchors = [...Array.from({ length }).keys()]
        .map(i => ({
          x: anchorX,
          y: rect.y + rect.height - anchorsHeight + i * anchorDeltaY,
        }));

      return [id, anchors];
    })
    .filter((entry): entry is [string, { x: number; y: number }[]] => Boolean(entry));

  return Object.fromEntries(entries);
}

function generateLinkLine(link: TreeNodeLink) {
  const { bundle, source, target } = link;

  // true 'up' - false 'down'
  const dir = source.y < target.y;

  const r = Math.min(12, 0.5 * (Math.max(source.y, target.y) - Math.min(source.y, target.y)));

  const dx = nodeWidth + bundle * 24;

  const d1y = dir ? source.y + r : source.y - r;
  const d2y = dir ? target.y - r : target.y + r;

  const a = 3;

  return [
    `M ${source.x} ${source.y}`,
    `L ${dx - r} ${source.y}`,
    `A ${r} ${r} 0 0 ${Number(dir)} ${dx} ${d1y}`,
    `L ${dx} ${d2y}`,
    `A ${r} ${r} 0 0 ${Number(dir)} ${dx - r} ${target.y}`,
    `L ${target.x} ${target.y}`,
    `M ${target.x + a} ${target.y - a}`,
    `L ${target.x} ${target.y}`,
    `L ${target.x + a} ${target.y + a}`,
  ].join('\n');
}

function generateLinkColor(link: TreeNodeLink, length: number) {
  const h = Math.floor(180 + link.bundle / (length - 1) * 360) % 360;
  return `hsl(${h} 20% 40%)`;
}

// ### //

onMounted(() => {
  watch(
    () => payload,
    createGraph,
    { immediate: true },
  );
});
</script>

<template>
  <Draggable :width="width" :height="height">
    <svg
      v-if="linksMap"
      class="pointer-events-none absolute left-0 top-0"
      :width="width"
      :height="height"
    >
      <g>
        <path
          v-for="link of linksMap.values()"
          :key="link.id"
          :d="generateLinkLine(link)"
          fill="none"
          :stroke="generateLinkColor(link, linksMap.size)"
          class="stroke-2"
        />
      </g>
    </svg>
    <div>
      <template v-for="node of foldersMap.values()" :key="node.data.id">
        <GraphFolderNode :node="node" />
      </template>
      <template v-for="node of filesMap.values()" :key="node.data.id">
        <GraphFileNode
          :ref="(el: any) => nodesRefMap.set(node.data.id, el?.$el)"
          :node="node"
        />
      </template>
      <template v-for="node of othersMap.values()" :key="node.data.id">
        <GraphFileNode :node="node" />
      </template>
    </div>
  </Draggable>
</template>
