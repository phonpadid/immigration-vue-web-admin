import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type {
  ServiceForm,
  ServiceStates,
  SevicesFormState,
} from "../interface/service.interface";

export const useServiceStore = defineStore("services", () => {
  const isLoading = ref(false);
  const servicesByLang = reactive<ServiceStates>({
    lo: { data: [], total: 0 },
    en: { data: [], total: 0 },
    zh_cn: { data: [], total: 0 },
  });

  const error = ref<string | null>(null);
  const currentServices = ref<ServiceForm | null>(null);

  const formData = reactive<SevicesFormState>({
    lo: { title: "", content: "", description: "" },
    en: { title: "", content: "", description: "" },
    zh_cn: { title: "", content: "", description: "" },
  });

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
  const getAllService = async (
    lang: string = "lo",
    limit = 20,
    cursor?: string
  ) => {
    try {
      isLoading.value = true;
      let url = `/services?limit=${limit}&lang=${lang}`;
      if (cursor) {
        url += `&cursor=${cursor}`;
      }

      const { data } = await api.get(url);

      if (data?.data && Array.isArray(data.data)) {
        servicesByLang[lang] = {
          data: data.data,
          total: data.total || data.data.length,
        };
      }
      return data;
    } catch (error) {
      console.error(`❌ Failed to fetch ${lang} data:`, error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const getServiceById = async (id: number, lang: string = "lo") => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/services/${id}?lang=${lang}`);

      if (data) {
        currentServices.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch by ID:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const createService = async (data: Record<string, any>) => {
    try {
      isLoading.value = true;
      // รีเซ็ต error state
      error.value = null;

      // เปลี่ยนจาก FormData เป็นการส่ง JSON โดยตรง
      const response = await api.post("/services", data, {
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

  const updateService = async (id: number, data: any) => {
    try {
      isLoading.value = true;

      // ตรวจสอบโครงสร้างข้อมูลที่ได้รับ
      console.log("Update data structure:", data);

      // สำหรับโครงสร้างแบบใหม่ที่มี translates array
      if (data.translates && Array.isArray(data.translates)) {
        data.translates.forEach((translate: any) => {
          if (translate && typeof translate.content !== "string") {
            translate.content = JSON.stringify(translate.content);
          }
        });
      }
      // สำหรับโครงสร้างแบบเดิม
      else {
        Object.keys(data).forEach((key) => {
          if (
            key !== "id" &&
            data[key] &&
            typeof data[key] === "object" &&
            data[key].content !== undefined
          ) {
            if (typeof data[key].content !== "string") {
              data[key].content = JSON.stringify(data[key].content);
            }
          }
        });
      }

      const response = await api.put(`/services/${id}`, data, {
        headers: { "Content-Type": "application/json" },
      });

      return response.data;
    } catch (error) {
      console.error("Failed to update service:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteService = async (id: number) => {
    try {
      isLoading.value = true;
      const res = await api.delete(`/services/${id}`);
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
    servicesByLang,
    getAllService,
    getServiceById,
    createService,
    updateService,
    deleteService,
    currentServices,
    clearDetailsCache,
    error,
  };
});
