import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type { NewResponse } from "../interface/new.interface";

export const useNewsStore = defineStore("news", () => {
  const isLoading = ref(false);
  const news = reactive<{ data: NewResponse[]; total: number }>({
    data: [],
    total: 0,
  });
  const currentNews = ref<NewResponse | null>(null);

  const getAllNews = async (offset = 0, limit = 10) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/news?offset=${offset}&limit=${limit}`);

      if (data?.data && Array.isArray(data.data)) {
        news.data = data.data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch news:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const getNewsById = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/news/${id}`);

      if (data) {
        currentNews.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch news by ID:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const createNews = async (news: NewResponse) => {
    try {
      isLoading.value = true;
      const { data } = await api.post("/news", news);

      if (data) {
        await getAllNews();
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to create role:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const updateNews = async (id: number, updatedData: Partial<NewResponse>) => {
    try {
      isLoading.value = true;
      const { data } = await api.put(`/news/${id}`, updatedData);

      if (data) {
        await getAllNews();
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to update news:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const deleteNews = async (id: number) => {
    try {
      isLoading.value = true;
      const res = await api.delete(`/news/${id}`);
      if (res) {
        await getAllNews();
      }
    } catch (error) {
      console.log(error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    news,
    currentNews,
    getAllNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
  };
});
