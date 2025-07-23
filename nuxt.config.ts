// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/ui',
    '@vueuse/nuxt',
  ],

  ssr: false,
  devtools: { enabled: false },

  app: {
    baseURL: './',
    head: {
      title: 'Module Graph Inspector',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
      viewport: 'width=device-width,initial-scale=1',
    },
  },

  css: ['~/assets/css/main.css'],
  ui: {
    colorMode: false,
  },

  srcDir: 'app',
  sourcemap: true,
  compatibilityDate: '2025-05-15',

  nitro: {
    output: {
      dir: './dist/app',
    },
    experimental: {
      websocket: true,
    },
    preset: 'static',
    routeRules: {
      ...Object.fromEntries([
        '/',
        '/200.html',
        '/404.html',
      ].map(route => [route, { prerender: true }])),
      '/*': {
        prerender: false,
      },
    },
    sourceMap: false,
  },

  vite: {
    base: './',
    server: {
      proxy: {
        '/api/socket': {
          // @todo get port dynamically
          target: `ws://localhost:7777/api/socket`,
          ws: true,
          rewriteWsOrigin: true,
        },
      },
    },
  },

  eslint: {
    config: {
      standalone: false,
    },
  },
});
