import { nextTick, ref } from 'vue';

export type ToastType = 'warning' | 'error';

type ToastProps = {
  type: ToastType;
  message: string;
};

type Toast = ToastProps & {
  id: number;
};

export const toasts = ref<Toast[]>([]);

export async function addToast(type: ToastType, message: string) {
  toasts.value.push({
    id: Date.now(),
    type,
    message,
  });

  await new Promise(resolve => setTimeout(resolve, 3000));

  await nextTick();

  toasts.value = [...toasts.value].slice(1);
}
