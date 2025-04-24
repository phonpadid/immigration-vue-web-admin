import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type { HotelForm } from "../interface/hotels.interface";

/****************************************************************** */

export const useHotelsStore = defineStore("hotels", () => {
  const isLoading = ref(false);
  const hotels = reactive<{
    data: HotelForm[];
    total: number;
  }>({
    data: [],
    total: 0,
  });
  const currentHotels = ref<HotelForm | null>(null);

  /****************************************************************** */

  const getAllHotels = async (
    offset = 0,
    limit = 10,
    is_published?: string
  ) => {
    try {
      isLoading.value = true;
      let url = `/hotel?offset=${offset}&limit=${limit}`;

      if (is_published !== undefined && is_published !== "") {
        url += `&is_published=${is_published}`;
      }
      const { data } = await api.get(url);

      if (data?.data && Array.isArray(data.data)) {
        hotels.data = data.data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch :", error);
    } finally {
      isLoading.value = false;
    }
  };
  /****************************************************************** */

  const getHotelsById = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/hotel/${id}`);

      if (data) {
        currentHotels.value = data;
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch by ID:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  /****************************************************************** */

  const appendFormData = (
    formData: FormData,
    key: string,
    value: any
  ): void => {
    // Skip undefined or null values
    if (value === undefined || value === null) {
      return;
    }

    if (value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
    } else {
      formData.append(key, String(value));
    }
  };

  // ใช้ใน createHotels function
  const createHotels = async (form: HotelForm) => {
    try {
      isLoading.value = true;
      const formData = new FormData();

      // ใช้ helper function เพื่อความสะดวกและปลอดภัย
      appendFormData(formData, "image", form.image);
      appendFormData(formData, "link", form.link);
      appendFormData(formData, "phone_number", form.phone_number);
      appendFormData(formData, "is_published", form.is_published);
      appendFormData(formData, "lo", form.lo);
      appendFormData(formData, "en", form.en);
      appendFormData(formData, "zh_cn", form.zh_cn);

      if (form.user) {
        appendFormData(formData, "user", form.user);
      }

      // Log data being sent
      console.log("FormData entries:");
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const { data } = await api.post("/hotel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data) {
        await getAllHotels();
        return data;
      }
    } catch (error) {
      console.error("Failed to create hotel:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  /****************************************************************** */
  // Function to update hotel data
  const updateHotels = async (id: number, form: Partial<HotelForm>) => {
    try {
      isLoading.value = true;
      const formData = new FormData();

      // ใช้ helper function เพื่อความสะดวกและปลอดภัย
      if (form.image instanceof File) {
        appendFormData(formData, "image", form.image);
      }

      appendFormData(formData, "link", form.link);
      appendFormData(formData, "phone_number", form.phone_number);
      appendFormData(formData, "is_published", form.is_published);

      // สำคัญ: ส่ง ID ไปด้วยในข้อมูลภาษา
      appendFormData(formData, "lo", form.lo);
      appendFormData(formData, "en", form.en);
      appendFormData(formData, "zh_cn", form.zh_cn);

      // Add user data if provided - ส่ง ID ไปด้วย
      if (form.user) {
        appendFormData(formData, "user", form.user);
      }

      // Debug logging
      console.log("FormData entries to be sent:");
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // ส่งข้อมูลไปยัง API
      const { data } = await api.put(`/hotel/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data) {
        // รีเฟรชข้อมูล
        await getAllHotels();

        // อัปเดต currentHotels ถ้ากำลังดูโรงแรมที่เพิ่งอัปเดต
        if (currentHotels.value?.id === id) {
          currentHotels.value = data;
        }

        return data;
      }
    } catch (error) {
      console.error("Failed to update hotel:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  /****************************************************************** */
  const deleteHotels = async (id: number) => {
    try {
      isLoading.value = true;
      const res = await api.delete(`/hotel/${id}`);
      if (res) {
        await getAllHotels();
      }
    } catch (error) {
      console.log(error);
    } finally {
      isLoading.value = false;
    }
  };
  /****************************************************************** */
  const checkStatusPublic = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.put(`/hotel/${id}/public`);
      if (data) {
        const index = hotels.data.findIndex((item) => item.id === id);
        if (index !== -1) {
          hotels.data = [
            ...hotels.data.slice(0, index),
            { ...hotels.data[index], is_published: true },
            ...hotels.data.slice(index + 1),
          ];
        }
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to update status:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const checkStatusPrivate = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.put(`/hotel/${id}/private`);

      if (data) {
        const index = hotels.data.findIndex((item) => item.id === id);
        if (index !== -1) {
          hotels.data = [
            ...hotels.data.slice(0, index),
            { ...hotels.data[index], is_published: false },
            ...hotels.data.slice(index + 1),
          ];
        }
        return data;
      }
    } catch (error) {
      console.error("❌ Failed to update status:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    hotels,
    currentHotels,
    getAllHotels,
    getHotelsById,
    deleteHotels,
    createHotels,
    updateHotels,

    checkStatusPrivate,
    checkStatusPublic,
  };
});
