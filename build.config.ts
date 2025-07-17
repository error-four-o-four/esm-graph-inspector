import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: [
    './src/index.ts',
  ],
  outDir: 'dist/cli',
  declaration: 'node16',
  rollup: {
    inlineDependencies: true,
  },
});
