export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    console.warn(error);
    console.warn(instance);
    console.warn(info);
  };
});
