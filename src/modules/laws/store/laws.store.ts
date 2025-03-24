import { buildFormData } from "@/utils/FuntionFormData";
import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type { LawResponse } from "../interface/laws.interface";

export const useLawStore = defineStore("laws", () => {
  const isLoading = ref(false);
  const laws = reactive<{ data: LawResponse[]; total: number }>({
    data: [],
    total: 0,
  });
  const currentLaws = ref<LawResponse | null>(null);

  const getAlllaws = async (offset = 0, limit = 10) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/law?offset=${offset}&limit=${limit}`);

      if (data?.data && Array.isArray(data.data)) {
        laws.data = data.data;
        laws.total = data.total ?? 0;
      }
    } catch (error) {
      console.error("❌ Failed to fetch laws:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const getLawById = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/law/${id}`);

      if (data) {
        currentLaws.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch user by ID:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const createLaws = async (form: { name: string; file: File | string |null }) => {
    try {
      isLoading.value = true;
      const formData = buildFormData({
        name: form.name,
        file: form.file,
      });

      const { data } = await api.post("/law", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data) {
        await getAlllaws();
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to create laws:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const updateLaws = async (
    id: number,
    form: Partial<{
      name: string;
      file: File;
    }>
  ) => {
    try {
      isLoading.value = true;
      const formData = buildFormData({
        name: form.name,
        file: form.file,
      });

      const { data } = await api.put(`/law/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data) {
        await getAlllaws();
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to update laws:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const getDetailsLaw = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/law/${id}`);

      if (data) {
        currentLaws.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch laws by ID:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteLaws = async (id: number) => {
    try {
      isLoading.value = true;
      const res = await api.delete(`/law/${id}`);
      if (res) {
        await getAlllaws();
      }
    } catch (error) {
      console.log(error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    laws,
    getAlllaws,
    getLawById,
    createLaws,
    updateLaws,
    deleteLaws,
    getDetailsLaw,
  };
});
