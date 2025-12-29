import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type {
  NationalityForm,
  NationalityStates,
  NationalityFormState,
} from "../interface/nationality.interface";

export const useNationalityStore = defineStore("nationalities", () => {
  const isLoading = ref(false);
  const nationalitiesByLang = reactive<NationalityStates>({
    lo: { data: [], total: 0 },
    en: { data: [], total: 0 },
    zh_cn: { data: [], total: 0 },
  });

  const error = ref<string | null>(null);
  const currentNationality = ref<NationalityForm | null>(null);

  const formData = reactive<NationalityFormState>({
    lo: { name: "", short_name: "" },
    en: { name: "", short_name: "" },
    zh_cn: { name: "", short_name: "" },
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

  const getAllNationalities = async (
    lang: string = "lo",
    limit = 20,
    cursor?: string
  ) => {
    try {
      isLoading.value = true;
      let url = `/nationalities?limit=${limit}&lang=${lang}`;
      if (cursor) {
        url += `&cursor=${cursor}`;
      }

      const { data } = await api.get(url);

      if (data?.data && Array.isArray(data.data)) {
        nationalitiesByLang[lang] = {
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

  const getNationalityById = async (id: number, lang: string = "lo") => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/nationalities/${id}?lang=${lang}`);

      if (data) {
        currentNationality.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch by ID:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const createNationality = async (data: Record<string, any>) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await api.post("/nationalities", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to create nationality";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateNationality = async (id: number, data: any) => {
    try {
      isLoading.value = true;

      console.log("Update data structure:", data);

      const response = await api.put(`/nationalities/${id}`, data, {
        headers: { "Content-Type": "application/json" },
      });

      return response.data;
    } catch (error) {
      console.error("Failed to update nationality:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteNationality = async (id: number) => {
    try {
      isLoading.value = true;
      const res = await api.delete(`/nationalities/${id}`);
      return res;
    } catch (error) {
      console.error("Failed to delete nationality:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

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
    nationalitiesByLang,
    getAllNationalities,
    getNationalityById,
    createNationality,
    updateNationality,
    deleteNationality,
    currentNationality,
    clearDetailsCache,
    error,
  };
});
