import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "@/lib/axios";
import type { DepartureTourismReport } from "../interface/departure-tourism.interface";
import { notification } from "ant-design-vue";

export const useDepartureTourismStore = defineStore("departureTourism", () => {
  const isLoading = ref(false);
  const report = ref<DepartureTourismReport | null>(null);

  const fetchReport = async () => {
    try {
      isLoading.value = true;
      const { data } = await api.get("/report/departure-tourism");
      report.value = data as DepartureTourismReport;
      return data as DepartureTourismReport;
    } catch (error) {
      console.error("❌ Failed to fetch departure tourism report", error);
      notification.error({
        message: "ຂໍ້ຜິດພາດ",
        description: "ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍງານການອອກຈາກປະເທດໄດ້",
      });
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    report,
    fetchReport,
  };
});
