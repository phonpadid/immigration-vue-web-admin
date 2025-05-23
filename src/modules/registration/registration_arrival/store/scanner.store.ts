// stores/scanner.store.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import type { ScannerType } from "../interface/arrival.interface";
import { api } from "@/lib/axios";
import { notification } from "ant-design-vue";

export const useScannerStore = defineStore("scanner", () => {
  const isLoading = ref(false);
  const currentScanType = ref<ScannerType>("arrival");

  // ฟังก์ชันสำหรับตั้งค่าประเภทการสแกน
  const setScannerType = (type: ScannerType) => {
    console.log(
      "Changing scanner type from",
      currentScanType.value,
      "to",
      type
    );
    currentScanType.value = type;
    console.log("Scanner type is now:", currentScanType.value);
  };

  // ฟังก์ชันสำหรับสแกน QR code
  const scanCode = async (verification_code: string) => {
    try {
      isLoading.value = true;
      console.log("Current scan type:", currentScanType.value);
      // เลือก endpoint ตามประเภทการสแกน
      const endpoint =
        currentScanType.value === "arrival"
          ? "/arrival/scan"
          : "/departure/scan";

      const { data } = await api.post(endpoint, {
        verification_code,
      });

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
      notification.error({
        message: "ຂໍ້ຜິດພາດ",
        description: errorMessage,
      });
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    currentScanType,
    setScannerType,
    scanCode,
  };
});
