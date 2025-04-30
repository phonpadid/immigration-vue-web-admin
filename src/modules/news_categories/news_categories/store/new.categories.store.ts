import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type {
  NewsCategoryForm,
  CreateNewsCategoryForm,
} from "../interface/new.categories.interface";

export const useNewscategoriesStore = defineStore("nesCategories", () => {
  const isLoading = ref(false);
  const newsCategories = reactive<{ data: NewsCategoryForm[]; total: number }>({
    data: [],
    total: 0,
  });
  const currentNewsCategories = ref<NewsCategoryForm | null>(null);

  const getAllNewsCategories = async (offset = 0, limit = 10) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(
        `/news-categories?offset=${offset}&limit=${limit}`
      );

      if (data?.data && Array.isArray(data.data)) {
        newsCategories.data = data.data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch roles:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const getNewsCategoriesById = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/news-categories/${id}`);

      if (data) {
        currentNewsCategories.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch role by ID:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const createNewsCategories = async (
    newsCategories: CreateNewsCategoryForm
  ) => {
    try {
      isLoading.value = true;
      const { data } = await api.post("/news-categories", newsCategories);

      if (data) {
        await getAllNewsCategories();
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to create role:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const updateNewsCategories = async (
    id: number,
    updatedData: Partial<NewsCategoryForm>
  ) => {
    try {
      isLoading.value = true;
      const { data } = await api.put(`/news-categories/${id}`, updatedData);

      if (data) {
        await getAllNewsCategories();
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to update role:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const deleteCategories = async (id: number) => {
    try {
      isLoading.value = true;
      const res = await api.delete(`/news-categories/${id}`);
      if (res) {
        await getAllNewsCategories();
      }
    } catch (error) {
      console.log(error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    newsCategories,
    currentNewsCategories,
    getAllNewsCategories,
    getNewsCategoriesById,
    createNewsCategories,
    updateNewsCategories,
    deleteCategories,
  };
});
