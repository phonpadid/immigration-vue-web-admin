import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type { NewResponse } from "../interface/new.interface";

// กำหนด interface สำหรับ payload ในการสร้างข่าวใหม่
export interface CreateNewsPayload {
  category_id: string;
  status: string;
  thumbnail: string;
  translates: {
    lang: string;
    title: string;
    description: string;
    content: string;
    slug?: string;
  }[];
}

export const useNewsStore = defineStore("news", () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const news = reactive<{ data: NewResponse[]; total: number }>({
    data: [],
    total: 0,
  });
  const currentNews = ref<NewResponse | null>(null);

  // รีเซ็ตข้อความ error
  const resetError = () => {
    error.value = null;
  };

  const getAllNews = async (
    params: {
      offset?: number;
      limit?: number;
      category_id?: string;
      status?: string;
    } = {}
  ) => {
    try {
      isLoading.value = true;
      resetError();
      const queryParams = new URLSearchParams();
      if (params.offset !== undefined)
        queryParams.append("offset", params.offset.toString());
      if (params.limit !== undefined)
        queryParams.append("limit", params.limit.toString());
      if (params.category_id && params.category_id !== "all")
        queryParams.append("category_id", params.category_id);
      if (params.status && params.status !== "all")
        queryParams.append("status", params.status);

      const url = `/news?${queryParams.toString()}`;
      const { data } = await api.get(url);

      if (data?.data && Array.isArray(data.data)) {
        news.data = data.data;
        news.total = data.total || data.data.length;
      }
    } catch (err: any) {
      console.error("❌ Failed to fetch news:", err);
      error.value = err.response?.data?.message || "Failed to fetch news";
    } finally {
      isLoading.value = false;
    }
  };

  const getNewsById = async (id: number) => {
    try {
      isLoading.value = true;
      resetError();
      const { data } = await api.get(`/news/${id}`);

      if (data) {
        currentNews.value = data;
        return data;
      }
      return null;
    } catch (err: any) {
      console.error("❌ Failed to fetch news by ID:", err);
      error.value =
        err.response?.data?.message || "Failed to fetch news details";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createNews = async (newsData: CreateNewsPayload) => {
    try {
      isLoading.value = true;
      resetError();

      // Log ข้อมูลที่จะส่งไป API เพื่อตรวจสอบ
      console.log("Creating news with data:", newsData);

      const { data } = await api.post("/news", newsData);

      if (data) {
        console.log("News created successfully:", data);
        await getAllNews();
        return data;
      }
      return null;
    } catch (err: any) {
      console.error("❌ Failed to create news:", err);
      error.value = err.response?.data?.message || "Failed to create news";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // เพิ่มฟังก์ชันใหม่สำหรับส่งข้อมูลแบบ FormData
  const createNewsWithFormData = async (formData: FormData) => {
    try {
      isLoading.value = true;
      resetError();

      // แสดงข้อมูลเพื่อตรวจสอบ (เฉพาะ dev mode)
      console.log("Creating news with FormData...");
      // แสดงรายการ key ใน FormData เพื่อตรวจสอบ
      for (const pair of formData.entries()) {
        if (pair[0] === "thumbnail") {
          console.log(`${pair[0]}: [File object]`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      // ส่งข้อมูลไปยัง API โดยใช้ axios
      const { data } = await api.post("/news", formData, {
        headers: {
          // ไม่ต้องกำหนด Content-Type เพราะ axios จะจัดการให้อัตโนมัติเมื่อส่ง FormData
          // 'Content-Type': 'multipart/form-data'
        },
      });

      if (data) {
        console.log("News created successfully:", data);
        await getAllNews();
        return data;
      }
      return null;
    } catch (err: any) {
      console.error("❌ Failed to create news with FormData:", err);
      error.value = err.response?.data?.message || "Failed to create news";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateNews = async (
    id: number,
    updatedData: Partial<CreateNewsPayload>
  ) => {
    try {
      isLoading.value = true;
      resetError();
      const { data } = await api.put(`/news/${id}`, updatedData);

      if (data) {
        await getAllNews();
        return data;
      }
      return null;
    } catch (err: any) {
      console.error("❌ Failed to update news:", err);
      error.value = err.response?.data?.message || "Failed to update news";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // เพิ่มฟังก์ชันใหม่สำหรับอัพเดตข้อมูลแบบ FormData
  const updateNewsWithFormData = async (id: number, formData: FormData) => {
    try {
      isLoading.value = true;
      resetError();

      // แสดงข้อมูลเพื่อตรวจสอบ (เฉพาะ dev mode)
      console.log(`Updating news ${id} with FormData...`);

      const { data } = await api.put(`/news/${id}`, formData, {
        headers: {
          // ไม่ต้องกำหนด Content-Type เพราะ axios จะจัดการให้อัตโนมัติ
        },
      });

      if (data) {
        await getAllNews();
        return data;
      }
      return null;
    } catch (err: any) {
      console.error("❌ Failed to update news with FormData:", err);
      error.value = err.response?.data?.message || "Failed to update news";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteNews = async (id: number) => {
    try {
      isLoading.value = true;
      resetError();
      const res = await api.delete(`/news/${id}`);
      if (res) {
        await getAllNews();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("❌ Failed to delete news:", err);
      error.value = err.response?.data?.message || "Failed to delete news";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    news,
    currentNews,
    getAllNews,
    getNewsById,
    createNews,
    createNewsWithFormData, // เพิ่มฟังก์ชันใหม่
    updateNews,
    updateNewsWithFormData, // เพิ่มฟังก์ชันใหม่
    deleteNews,
    resetError,
  };
});
