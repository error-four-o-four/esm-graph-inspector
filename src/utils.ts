import { styleText } from 'node:util';

export const red = (s: string) => styleText('redBright', s);
export const yellow = (s: string) => styleText('yellow', s);
export const green = (s: string) => styleText('green', s);
export const cyan = (s: string) => styleText('cyan', s);
export const blue = (s: string) => styleText('blue', s);

export const clr = {
  red,
  yellow,
  green,
  cyan,
  blue,
};

export function createLogger(name: string, color: keyof typeof clr = 'cyan') {
  const pre = clr[color](`[${name}]`);

  return (
    msg: string,
    ...args: unknown[]
  ) => console.log(`${pre} ${msg}`, ...args);
}
