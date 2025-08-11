import { extensions } from '../../shared/data.js';
import { checkFileExistence } from '../utils.js';

export async function createEntryPoint(arg?: string) {
  return (arg) ? checkEntryPoint(arg) : findEntryPoint();
}

// @todo **/app.*
// @todo find and parse index.html
async function findEntryPoint() {
  return (
    await Promise.all(extensions
      .map(async (ext) => {
        const entry = `./src/index${ext}`;
        return (await checkFileExistence(entry)) ? entry : undefined;
      }))
  ).filter(Boolean)[0];
}

async function checkEntryPoint(arg: string) {
  return new Promise((resolve) => {
    checkFileExistence(arg)
      .then((exists) => {
        const value = exists ? arg : undefined;
        resolve(value);
      });
  }) as Promise<string | undefined>;
}
