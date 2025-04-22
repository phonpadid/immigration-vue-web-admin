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

  // Create country
  const createHotels = async (form: HotelForm) => {
    try {
      isLoading.value = true;

      // Build form data for multipart upload
      const formData = new FormData();

      // Add image if exists
      if (form.image) {
        formData.append("image", form.image);
      }

      // Add visa exemption status
      formData.append("is_published", form.is_published ? "1" : "0");

      const { data } = await api.post("/hotel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data) {
        await getAllHotels();
        return data;
      }
    } catch (error) {
      console.error("Failed to create :", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // Update country
  const updateHotels = async (id: number, form: Partial<HotelForm>) => {
    try {
      isLoading.value = true;

      // Build form data for multipart upload
      const formData = new FormData();

      // Add language data
      formData.append("map_link", JSON.stringify(form.map_link));
      formData.append("link", JSON.stringify(form.link));
      formData.append("phone_number", JSON.stringify(form.phone_number));
      formData.append("lo_name", JSON.stringify(form.lo_name));
      formData.append("lo_address", JSON.stringify(form.lo_address));
      formData.append("en_name", JSON.stringify(form.en_name));
      formData.append("en_address", JSON.stringify(form.en_address));
      formData.append("zh_name", JSON.stringify(form.zh_name));
      formData.append("zh_address", JSON.stringify(form.zh_address));

      // Add image if exists
      if (form.image) {
        formData.append("image", form.image);
      }

      // Add visa exemption status
      formData.append("is_published", form.is_published ? "1" : "0");

      const { data } = await api.put(`/country/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data) {
        await getAllHotels();
        return data;
      }
    } catch (error) {
      console.error("Failed to:", error);
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

  const checkStatusPrivate = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.put(`/hotel/${id}/private`);

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
