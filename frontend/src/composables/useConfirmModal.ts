import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { createApp, h } from 'vue';

export function useConfirmModal() {
  return (
    title: string,
    message: string,
    confirmBtnText?: string,
    cancelBtnText?: string,
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const app = createApp({
        render() {
          return h(ConfirmModal, {
            title,
            message,
            confirmBtnText,
            cancelBtnText,
            resolve: (value: boolean) => {
              resolve(value);
              app.unmount();
              container.remove();
            },
          });
        },
      });

      app.mount(container);
    });
  };
}
