import pkg from '../package.json' with { type: 'json' };
import { cyan, green, red } from './utils.js';

export const PKG_NAME = pkg.name;

export const PKG_VERSION = pkg.version;

export const MARK = {
  CHECK: green('✔'),
  INFO: cyan('i'),
  ERROR: red('⨉'),
} as const;
