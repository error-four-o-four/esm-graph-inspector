import type Container from '~/components/graph/Container.vue';
import type Folder from '~/components/tree/Folder.vue';
import type Layout from '~/components/tree/Layout.vue';

export type FolderInstance = InstanceType<typeof Folder>;

export type LayoutInstance = InstanceType<typeof Layout>;

export type ContainerInstance = InstanceType<typeof Container>;
