<script setup lang="ts">
import type { FileNode, Payload, TreeNode } from '~~/shared/types.js';
import type { HierarchyPointNode } from 'd3-hierarchy';

import { useEventListener } from '@vueuse/core';
import { hierarchy, tree } from 'd3-hierarchy';
import { nextTick, onMounted, ref, shallowReactive, shallowRef, useTemplateRef } from 'vue';

const { payload } = defineProps<{
  payload: Payload;
}>();

const width = ref(window.innerWidth);
const height = ref(window.innerHeight);

const container = useTemplateRef<HTMLDivElement>('container');

// example
// https://observablehq.com/@d3/hierarchical-edge-bundling
// https://observablehq.com/@d3/collapsible-tree
// https://observablehq.com/@d3/indented-tree

const foldersMap = shallowReactive(new Map<string, HierarchyPointNode<TreeNode>>());
const filesMap = shallowReactive(new Map<string, HierarchyPointNode<FileNode>>());
const linksMap = shallowReactive(new Map<TreeNodeLink['id'], TreeNodeLink>());
const refsMap = shallowReactive(new Map<string, HTMLDivElement>());

const nodes = shallowRef<HierarchyPointNode<TreeNode>[]>([]);

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
  // nodesMap.clear();

  // folders.value = [];
  nodes.value = [];

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
      }
    } else {
      // folders.value.push(node);
      foldersMap.set(id, node);
    }

    nodes.value.push(node);
    // nodesMap.set(node.data.id, node);
  });

  nextTick(() => {
    width.value = maxX + 1.75 * paddingX + nodeWidth;
    height.value = maxY + 2 * paddingY;

    createLinks(payload.links);

    if (payload.entry) {
      const entry = refsMap.get(payload.entry);
      entry?.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

function createLinks(data: Payload['links']) {
  if (!data) return;

  linksMap.clear();

  const bundles = createBundles(data);
  const anchors = createAnchors(bundles);

  let bundleIndex = 0;

  for (const id of Object.keys(data)) {
    const bundle = bundles[id]

    for (const from of bundle.from) {
      const linkId: TreeNodeLink['id'] = `${from}|${bundle.id}`;

      if (linksMap.has(linkId)) {
        console.log('skipped from', linkId);
        continue;
      }

      const fromAnchorIndex = bundles[from].all.indexOf(bundle.id);
      const fromAnchor = anchors[from][fromAnchorIndex];

      const toAnchorIndex = bundle.all.indexOf(from);
      const toAnchor = anchors[bundle.id][toAnchorIndex];

      linksMap.set(linkId, {
        id: linkId,
        // bundle: linksMap.size,
        bundle: bundleIndex,
        source: fromAnchor,
        target: toAnchor,
      });
    }

    bundleIndex += 1;
  }

  console.log(...linksMap.entries());
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
      const nodeRef = refsMap.get(id);

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

function getNextSibling(node: HierarchyPointNode<TreeNode>) {
  if (!node.parent || !node.parent.children) return undefined;

  return node.parent.children[node.parent.children.indexOf(node) + 1];
}

function generateFolderLine(node: HierarchyPointNode<TreeNode>) {
  if (!node.parent || !node.parent.children) return undefined;

  const next = getNextSibling(node) || getNextSibling(node.parent);

  if (!next) return undefined;

  const x = node.x + 10;
  return [
    `M${x},${node.y + 0.75 * nodeHeight}`,
    `L${x},${next.y - 0.5 * nodeHeight}`,
  ].join('\n');
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

const isGrabbing = shallowRef(false);

function handleDrag() {
  let x = 0;
  let y = 0;

  useEventListener(container, 'mousedown', (e) => {
    if (!container.value) return;

    isGrabbing.value = true;
    x = container.value.scrollLeft + e.pageX;
    y = container.value.scrollTop + e.pageY;
  });

  useEventListener(container, 'mousemove', (e) => {
    if (!container.value || !isGrabbing.value) return;

    e.preventDefault();
    container.value.scrollLeft = x - e.pageX;

    if (container.value.scrollLeft <= 0) {
      x = e.pageX;
    }

    if (container.value.scrollLeft >= container.value.scrollWidth - container.value.offsetWidth) {
      x = container.value.scrollLeft + e.pageX;
    }

    container.value.scrollTop = y - e.pageY;

    if (container.value.scrollTop <= 0) {
      y = e.pageY;
    }

    if (container.value.scrollTop >= container.value.scrollHeight - container.value.offsetHeight) {
      y = container.value.scrollTop + e.pageY;
    }
  });

  useEventListener(container, 'mouseleave', () => isGrabbing.value = false);
  useEventListener(container, 'mouseup', () => isGrabbing.value = false);
}

onMounted(() => {
  handleDrag();

  watch(
    () => payload,
    createGraph,
    { immediate: true },
  );
});
</script>

<template>
  <div ref="container" class="w-screen h-screen relative select-none overflow-auto">
    <div :style="{ minWidth: `${width}px`, minHeight: `${height}px` }">
      <svg
        class="pointer-events-none absolute left-0 top-0"
        :width="width"
        :height="height"
      >
        <g>
          <path
            v-for="folder of foldersMap.values()"
            :key="folder.data.id"
            :d="generateFolderLine(folder)"
            fill="none"
            class="stroke-neutral-800 stroke-2"
          />
        </g>
      </svg>
      <svg
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
      <template v-for="node of nodes" :key="node.data.id">
        <GraphNode
          v-if="node.data.name !== '<root>'"
          :ref="(el: any) => refsMap.set(node.data.id, el?.$el)"
          :node="node"
        />
      </template>
    </div>
  </div>
</template>
