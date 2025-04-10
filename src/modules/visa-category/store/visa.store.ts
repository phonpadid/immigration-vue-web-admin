import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type {
  VisaForm,
  VisaFormState,
  VisaState,
  VisaLanguageContent,
} from "../interface/visa.interface";

export const useVisaStore = defineStore("visa", () => {
  const isLoading = ref(false);
  const visaByLang = reactive<VisaState>({
    lo: { data: [], total: 0 },
    en: { data: [], total: 0 },
    zh_cn: { data: [], total: 0 },
  });

  const error = ref<string | null>(null);
  const currentVisa = ref<VisaForm | null>(null);

  const formData = reactive<VisaFormState>({
    lo: { name: "", content: "" },
    en: { name: "", content: "" },
    zh_cn: { name: "", content: "" },
  });

  const resetForm = () => {
    Object.keys(formData).forEach((lang) => {
      formData[lang as keyof VisaFormState] = { name: "", content: "" };
    });
  };
  const detailsLoadingState = reactive<{
    [key: string]: { [key: number]: boolean };
  }>({
    lo: {},
    en: {},
    zh_cn: {},
  });

  const currentDetails = reactive<{
    [key: string]: { [key: number]: any };
  }>({
    lo: {},
    en: {},
    zh_cn: {},
  });
  const getAllVisa = async (
    lang: string = "lo",
    limit = 20,
    cursor?: string
  ) => {
    try {
      isLoading.value = true;
      let url = `/visa-category?limit=${limit}&lang=${lang}`;
      if (cursor) {
        url += `&cursor=${cursor}`;
      }

      const { data } = await api.get(url);

      if (data?.data && Array.isArray(data.data)) {
        visaByLang[lang] = {
          data: data.data,
          total: data.total || data.data.length,
        };
      }
      return data;
    } catch (error) {
      console.error(`❌ Failed to fetch ${lang} visa data:`, error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // ฟังก์ชันดึงข้อมูลรายละเอียดวีซ่าตามภาษา
  const getVisaDetails = async (id: number, lang: string = "lo") => {
    // ตรวจสอบว่ามีข้อมูลในแคชแล้วหรือไม่
    if (currentDetails[lang][id]) {
      return currentDetails[lang][id];
    }

    // ตรวจสอบว่ากำลังโหลดอยู่หรือไม่
    if (detailsLoadingState[lang][id]) {
      return null;
    }

    try {
      detailsLoadingState[lang][id] = true;
      const { data } = await api.get(
        `/visa-category/${id}/detail?lang=${lang}`
      );

      if (data) {
        // เก็บข้อมูลในแคช
        currentDetails[lang][id] = data;
        return data;
      }
    } catch (error) {
      console.error(`❌ Failed to fetch visa details (${lang}):`, error);
      throw error;
    } finally {
      detailsLoadingState[lang][id] = false;
    }
  };

  const getVisaById = async (id: number, lang: string = "lo") => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/visa-category/${id}?lang=${lang}`);

      if (data) {
        currentVisa.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch by ID:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const createVisa = async (data: Record<string, any>) => {
    try {
      isLoading.value = true;
      // รีเซ็ต error state
      error.value = null;

      // เปลี่ยนจาก FormData เป็นการส่ง JSON โดยตรง
      const response = await api.post("/visa-category", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (err: any) {
      // เซ็ต error message
      error.value = err.response?.data?.message || "Failed to create visa";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateVisa = async (id: number, data: any) => {
    try {
      isLoading.value = true;

      // ตรวจสอบว่า content เป็น string ทั้งหมด
      Object.keys(data).forEach((lang) => {
        if (typeof data[lang].content !== "string") {
          data[lang].content = JSON.stringify(data[lang].content);
        }
      });

      const response = await api.put(`/visa-category/${id}`, data, {
        headers: { "Content-Type": "application/json" },
      });

      return response.data;
    } catch (error) {
      console.error("Failed to update visa:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteVisa = async (id: number) => {
    try {
      isLoading.value = true;
      const res = await api.delete(`/visa-category/${id}`);
      return res;
    } catch (error) {
      console.error("Failed to delete visa:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // ล้างแคชข้อมูลรายละเอียด
  const clearDetailsCache = (lang?: string) => {
    if (lang) {
      currentDetails[lang] = {};
    } else {
      Object.keys(currentDetails).forEach((key) => {
        currentDetails[key] = {};
      });
    }
  };

  return {
    isLoading,
    visaByLang,
    currentVisa,
    currentDetails,
    getAllVisa,
    getVisaById,
    getVisaDetails,
    deleteVisa,
    createVisa,
    updateVisa,
    clearDetailsCache,
    error,
  };
});
