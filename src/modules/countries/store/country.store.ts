import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type { CountryForm } from "../interface/country.interface";

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

  const getAllCountry = async (offset = 0, limit = 10) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(
        `/country?offset=${offset}&limit=${limit}`
      );

      if (data?.data && Array.isArray(data.data)) {
        country.data = data.data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch :", error);
    } finally {
      isLoading.value = false;
    }
  };

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

  // const createCheckpointProvince = async (provinceData: ProvinceForm) => {
  //   try {
  //     isLoading.value = true;
  //     const { data } = await api.post("/provinces", provinceData);

  //     if (data) {
  //       await getAllCheckpointProvine();
  //       return data;
  //     }
  //   } catch (error) {
  //     console.error("❌ Failed to create :", error);
  //   } finally {
  //     isLoading.value = false;
  //   }
  // };

  // const updateCheckpointProcines = async (
  //   id: number,
  //   updatedData: Partial<ProvinceForm>
  // ) => {
  //   try {
  //     isLoading.value = true;
  //     const { data } = await api.put(`/provinces/${id}`, updatedData);

  //     if (data) {
  //       await getAllCheckpointProvine();
  //       return data;
  //     }
  //   } catch (error) {
  //     console.error("❌ Failed to update :", error);
  //   } finally {
  //     isLoading.value = false;
  //   }
  // };

  // const deleteCheckpointProvinces = async (id: number) => {
  //   try {
  //     isLoading.value = true;
  //     const res = await api.delete(`/provinces/${id}`);
  //     if (res) {
  //       await getAllCheckpointProvine();
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     isLoading.value = false;
  //   }
  // };

  return {
    isLoading,
    country,
    getAllCountry,
    getCountryById,
  };
});
