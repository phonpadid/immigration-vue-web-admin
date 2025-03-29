  import { defineStore } from "pinia";
  import { reactive, ref } from "vue";
  import { api } from "@/lib/axios";
  import type { ProvinceForm } from "../interface/province.interface";

  export const useCheckpointProvinceStore = defineStore(
    "checkpointProvince",
    () => {
      const isLoading = ref(false);
      const checkpointProvince = reactive<{
        data: ProvinceForm[];
        total: number;
      }>({
        data: [],
        total: 0,
      });
      const currentCheckpointProvince = ref<ProvinceForm | null>(null);

      // const getAllCheckpointProvine = async (offset = 0, limit = 10) => {
      //   try {
      //     isLoading.value = true;
      //     const { data } = await api.get(
      //       `/provinces?offset=${offset}&limit=${limit}`
      //     );

      //     if (data?.data && Array.isArray(data.data)) {
      //       checkpointProvince.data = data.data;
      //     }
      //   } catch (error) {
      //     console.error("❌ Failed to fetch :", error);
      //   } finally {
      //     isLoading.value = false;
      //   }
      // };
      const getAllCheckpointProvine = async (page = 1, pageSize = 10) => {
        try {
          isLoading.value = true;
          const offset = (page - 1) * pageSize;
          const { data } = await api.get(
            `/provinces?offset=${offset}&limit=${pageSize}`
          );

          if (data?.data && Array.isArray(data.data)) {
            checkpointProvince.data = data.data;
            checkpointProvince.total = data.total || 0; // เก็บค่า total
          }
        } catch (error) {
          console.error("❌ Failed to fetch :", error);
        } finally {
          isLoading.value = false;
        }
      };

      const getCheckpointProvinceById = async (id: number) => {
        try {
          isLoading.value = true;
          const { data } = await api.get(`/provinces/${id}`);

          if (data) {
            currentCheckpointProvince.value = data;
            return data;
          }
        } catch (error) {
          console.error("❌ Failed to fetch by ID:", error);
          throw error;
        } finally {
          isLoading.value = false;
        }
      };

      const createCheckpointProvince = async (provinceData: ProvinceForm) => {
        try {
          isLoading.value = true;
          const { data } = await api.post("/provinces", provinceData);

          if (data) {
            await getAllCheckpointProvine();
            return data;
          }
        } catch (error) {
          console.error("❌ Failed to create :", error);
        } finally {
          isLoading.value = false;
        }
      };

      const updateCheckpointProcines = async (
        id: number,
        updatedData: Partial<ProvinceForm>
      ) => {
        try {
          isLoading.value = true;
          const { data } = await api.put(`/provinces/${id}`, updatedData);

          if (data) {
            await getAllCheckpointProvine();
            return data;
          }
        } catch (error) {
          console.error("❌ Failed to update :", error);
        } finally {
          isLoading.value = false;
        }
      };

      const deleteCheckpointProvinces = async (id: number) => {
        try {
          isLoading.value = true;
          const res = await api.delete(`/provinces/${id}`);
          if (res) {
            await getAllCheckpointProvine();
          }
        } catch (error) {
          console.log(error);
        } finally {
          isLoading.value = false;
        }
      };

      return {
        isLoading,
        checkpointProvince,
        currentCheckpointProvince,
        getAllCheckpointProvine,
        getCheckpointProvinceById,
        createCheckpointProvince,
        updateCheckpointProcines,
        deleteCheckpointProvinces,
      };
    }
  );
