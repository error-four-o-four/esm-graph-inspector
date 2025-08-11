import socketHandler from '~~/src/handler/socket.js';

if (process.env.NODE_ENV === 'development') {
  (async () => {
    const { initialize } = await import('~~/src/data.js');
    initialize({ entry: './src/index.ts' });
  })();
}

export default socketHandler;
