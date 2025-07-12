// import { stat } from 'node:fs/promises';
// import { resolve } from 'node:path';

// type EntryPointResult = {
//   item: string;
//   error?: string;
// };

// export const defaultEntryPoints = [
//   './src/index.js',
//   './src/index.ts',
// ];

// async function promiseEntryPoint(item: string): Promise<EntryPointResult> {
//   const path = resolve(item);
//   const stats = await stat(path).catch(() => undefined);

//   const error = (!stats)
//     ? 'Unable to find entry point'
//     : (!stats.isFile())
//         ? 'Entry point is not a file'
//         : undefined;

//   return {
//     item,
//     error,
//   };
// }

// export async function getEntryPoints(input: string[]): Promise<EntryPointResult[]> {
//   const promised: Promise<EntryPointResult>[] = [];

//   if (input.length === 0) {
//     for (const entry of defaultEntryPoints) {
//       const item = resolve(entry);
//       promised.push(promiseEntryPoint(item));
//     }
//   } else {
//     for (const item of input) {
//       promised.push(promiseEntryPoint(item));
//     }
//   }

//   return (await Promise.all(promised));
// }
