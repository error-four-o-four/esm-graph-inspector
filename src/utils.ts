import { stat } from 'node:fs/promises';
import { styleText } from 'node:util';

export const red = (s: string) => styleText('redBright', s);
export const yellow = (s: string) => styleText('yellow', s);
export const green = (s: string) => styleText('green', s);
export const cyan = (s: string) => styleText('cyan', s);
export const blue = (s: string) => styleText('blue', s);

const clr = {
  red,
  yellow,
  green,
  cyan,
  blue,
};

// ###

// @todo verbose prod vs dev
export const hostLogger = createLogger('host', 'cyan');
export const wssLogger = createLogger('wss', 'blue');

function createLogger(name: string, color: keyof typeof clr) {
  const pre = clr[color](`[${name}]`);

  return (
    msg: string,
    ...args: unknown[]
  ) => console.log(`${pre} ${msg}`, ...args); // eslint-disable-line no-console
}

export const checkFileExistence = async (s: string) => Boolean(await stat(s).catch(() => undefined));

export const toRelative = (s: string) => s.startsWith('./') ? s : `./${s}`;
