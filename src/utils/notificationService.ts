// src/services/notificationService.ts
import { notification } from "ant-design-vue";

export const useNotification = () => {
  const openNotification = (
    type: "success" | "error" | "warning" | "info",
    message: string,
    description: string
  ) => {
    notification[type]({
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
