import socketHandler from '~~/src/handler/socket.js';

if (process.env.NODE_ENV === 'development') {
  (async () => {
    const { initialize } = await import('~~/src/data.js');
    // @todo dev
    // initialize({ entry: './nope.ts' });
    // initialize({ entry: './_dummy/index.ts' });
    initialize({ entry: './src/index.ts' });
  })();
}

export default socketHandler;
