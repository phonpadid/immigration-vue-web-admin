// src/services/notificationService.ts
import { notification } from "ant-design-vue";

export const useNotification = () => {
  const openNotification = (message: string, description: string) => {
    notification.open({
      message,
      description,
      onClick: () => {
        console.log("Notification Clicked!");
      },
    });
  };

  return {
    openNotification,
  };
};
