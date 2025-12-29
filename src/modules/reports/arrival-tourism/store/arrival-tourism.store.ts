import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "@/lib/axios";
import type { ArrivalTourismReport } from "../interface/arrival-tourism.interface";
import { notification } from "ant-design-vue";

export const useArrivalTourismStore = defineStore("arrivalTourism", () => {
  const isLoading = ref(false);
  const report = ref<ArrivalTourismReport | null>(null);

  const fetchReport = async () => {
    try {
      isLoading.value = true;
      const { data } = await api.get("/report/arrival-tourism");
      report.value = data as ArrivalTourismReport;
      return data as ArrivalTourismReport;
    } catch (error) {
      console.error("❌ Failed to fetch arrival tourism report", error);
      notification.error({
        message: "ຂໍ້ຜິດພາດ",
        description: "ບໍ່ສາມາດດຶງຂໍ້ມູນລາຍງານການເຂົ້າເມືອງດ້ານການທ່ອງທ່ຽວໄດ້",
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
