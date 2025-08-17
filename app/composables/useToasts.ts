import { nextTick, shallowRef } from 'vue';

export type ToastType = 'info' | 'warning' | 'error';

export type ToastProps = {
  type: ToastType;
  message: string;
};

type Toast = ToastProps & {
  id: number;
};

export const toasts = shallowRef<Toast[]>([]);

export async function addToast(type: ToastType, message: string) {
  toasts.value = [...toasts.value, {
    id: performance.now(),
    type,
    message,
  }];

  await new Promise(resolve => setTimeout(resolve, 3000));

  await nextTick();

  toasts.value = [...toasts.value].slice(1);
}

export default function useToasts() {
  return {
    toasts,
    addToast,
  };
}
