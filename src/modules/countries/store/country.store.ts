import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type { CountryForm } from "../interface/country.interface";

/****************************************************************** */

export const useCountryStore = defineStore("country", () => {
  const isLoading = ref(false);
  const country = reactive<{
    data: CountryForm[];
    total: number;
  }>({
    data: [],
    total: 0,
  });
  const currentCountry = ref<CountryForm | null>(null);

  /****************************************************************** */

  const getAllCountry = async (
    offset = 0,
    limit = 10,
    is_except_visa?: string
  ) => {
    try {
      isLoading.value = true;
      let url = `/country?offset=${offset}&limit=${limit}`;

      // เพิ่ม filter สำหรับ is_except_visa ถ้ามีค่า
      if (is_except_visa !== undefined && is_except_visa !== "") {
        url += `&is_except_visa=${is_except_visa}`;
      }
      const { data } = await api.get(url);

      if (data?.data && Array.isArray(data.data)) {
        country.data = data.data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch :", error);
    } finally {
      isLoading.value = false;
    }
  };
  /****************************************************************** */

  const getCountryById = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/country/${id}`);

      if (data) {
        currentCountry.value = data;
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
  const createCountry = async (form: CountryForm) => {
    try {
      isLoading.value = true;

      // Build form data for multipart upload
      const formData = new FormData();

      // Add language data
      formData.append("lo", JSON.stringify(form.lo));
      formData.append("en", JSON.stringify(form.en));
      formData.append("zh_cn", JSON.stringify(form.zh_cn));

      // Add image if exists
      if (form.image) {
        formData.append("image", form.image);
      }

      // Add visa exemption status
      formData.append("is_except_visa", form.is_except_visa ? "1" : "0");

      const { data } = await api.post("/country", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data) {
        await getAllCountry();
        return data;
      }
    } catch (error) {
      console.error("Failed to create country:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // Update country
  const updateCountry = async (id: number, form: Partial<CountryForm>) => {
    try {
      isLoading.value = true;

      // Build form data for multipart upload
      const formData = new FormData();

      // Add language data
      formData.append("lo", JSON.stringify(form.lo));
      formData.append("en", JSON.stringify(form.en));
      formData.append("zh_cn", JSON.stringify(form.zh_cn));

      // Add image if exists
      if (form.image) {
        formData.append("image", form.image);
      }

      // Add visa exemption status
      formData.append("is_except_visa", form.is_except_visa ? "1" : "0");

      const { data } = await api.put(`/country/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data) {
        await getAllCountry();
        return data;
      }
    } catch (error) {
      console.error("Failed to create country:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  /****************************************************************** */
  const deleteCountry = async (id: number) => {
    try {
      isLoading.value = true;
      const res = await api.delete(`/country/${id}`);
      if (res) {
        await getAllCountry();
      }
    } catch (error) {
      console.log(error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    country,
    getAllCountry,
    getCountryById,
    deleteCountry,
    createCountry,
    updateCountry,
  };
});
