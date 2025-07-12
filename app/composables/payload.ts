// import type { Payload } from "~~/shared/types";

// export const isLoading = ref(true);
// export const isFetching = ref(false);

// const endpoint = "/api/payload";

// let promised: Promise<Payload | undefined> | undefined;

// export async function init() {
//   if (promised)
//     return;

//   promised = get().then((payload) => {
//     initWebSocket(payload.port);

//     return payload;
//   });
// }

// async function get() {
//   isFetching.value = true;

//   const payload = await $fetch<Payload>(endpoint);
//   isLoading.value = false;
//   isFetching.value = false;

//   console.log(payload);

//   return payload;
// }

// function initWebSocket(port: Payload["port"]) {
//   if (!port)
//     console.error("Unable to establish websocket connection!");

//   const ws = new WebSocket(`ws://${location.hostname}:${port}`);

//   ws.addEventListener("message", (event) => {
//     console.log("From Server:", event.data);
//   });

//   ws.addEventListener("open", async () => {
//     console.log("WebSocket connected");
//   });

//   ws.addEventListener("close", async () => {
//     console.log("WebSocket closed");
//   });

//   ws.addEventListener("error", async (error) => {
//     console.error("WebSocket Error: %o", error);
//   });
// }
