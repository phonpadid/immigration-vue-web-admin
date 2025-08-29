import { defineStore } from "pinia";
import { ref } from "vue";
import type { ScannerType } from "../interface/arrival.interface";
import { api } from "@/lib/axios";
import { formatDateTime } from "@/utils/FormatDataTime";

export const useScannerStore = defineStore("scanner", () => {
  const isLoading = ref(false);
  const currentScanType = ref<ScannerType>("arrival");
  const isModalVisible = ref(false);
  const modalMessage = ref("");
  const modalTitle = ref("");
  const modalButtons = ref<
    Array<{
      text: string;
      style?: Record<string, string>;
      onClick?: () => void;
    }>
  >([]);

  const setScannerType = (type: ScannerType) => {
    currentScanType.value = type;
  };

  // ปรับปรุงให้มีเฉพาะปุ่มตกลง
  const showAlertModal = (title: string, message: string) => {
    modalTitle.value = title;
    modalMessage.value = message;
    modalButtons.value = [
      {
        text: "ຕົກລົງ",
        style: {
          backgroundColor: "#466d1d",
          color: "#ffffff",
          borderColor: "#466d1d",
          hoverBackgroundColor: "#324b1c",
          hoverColor: "#ffffff",
          hoverBorderColor: "#324b1c",
          width: "100%",
          marginBottom: "0",
          height: "40px",
          fontSize: "16px",
          fontWeight: "500",
        },
        onClick: () => {
          isModalVisible.value = false;
        },
      },
    ];
    isModalVisible.value = true;
  };

  const hideModal = () => {
    isModalVisible.value = false;
    modalMessage.value = "";
    modalTitle.value = "";
    modalButtons.value = [];
  };

  const scanCode = async (verification_code: string) => {
    try {
      isLoading.value = true;
      const endpoint =
        currentScanType.value === "arrival"
          ? "/arrival/scan"
          : "/departure/scan";

      const { data } = await api.post(endpoint, {
        verification_code,
      });

      if (data?.verified_at) {
        showAlertModal(
          "ແຈ້ງເຕືອນ",
          `QR Code ນີ້ໄດ້ຮັບການຢືນຢັນແລ້ວ ເມື່ອ ${formatDateTime(
            data.verified_at
          )}`
        );
        return null;
      }

      if (data?.id) {
        return {
          id: data.id,
          type: currentScanType.value,
        };
      }

      throw new Error("ບໍ່ພົບຂໍ້ມູນ");
    } catch (error: any) {
      console.error(
        `❌ Failed to scan ${currentScanType.value} QR code`,
        error
      );
      const errorMessage =
        error.response?.data?.message || "ບໍ່ສາມາດສະແກນ QR Code ໄດ້";

      showAlertModal("ຂໍ້ຜິດພາດ", errorMessage);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    currentScanType,
    setScannerType,
    scanCode,
    isModalVisible,
    modalMessage,
    modalTitle,
    modalButtons,
    hideModal,
  };
});
