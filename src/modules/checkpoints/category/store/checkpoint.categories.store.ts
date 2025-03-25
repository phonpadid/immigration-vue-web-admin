import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type { CheckpointCategoriesForm } from "../interface/checkpoint.categories.interface";

export const useCheckpointcategoriesStore = defineStore(
  "checkpointCategories",
  () => {
    const isLoading = ref(false);
    const checkpointCategories = reactive<{
      data: CheckpointCategoriesForm[];
      total: number;
    }>({
      data: [],
      total: 0,
    });
    const currentCheckpointCategories = ref<CheckpointCategoriesForm | null>(
      null
    );

    const getAllCheckpointCategories = async (offset = 0, limit = 10) => {
      try {
        isLoading.value = true;
        const { data } = await api.get(
          `/checkpoint-categories?offset=${offset}&limit=${limit}`
        );

        if (data?.data && Array.isArray(data.data)) {
          checkpointCategories.data = data.data;
        }
      } catch (error) {
        console.error("❌ Failed to fetch checkpointCategories:", error);
      } finally {
        isLoading.value = false;
      }
    };

    const getCheckpointCategoriesById = async (id: number) => {
      try {
        isLoading.value = true;
        const { data } = await api.get(`/checkpoint-categories/${id}`);

        if (data) {
          currentCheckpointCategories.value = data;
          return data;
        }
      } catch (error) {
        console.error("❌ Failed to fetch checkpointCategoires by ID:", error);
        throw error;
      } finally {
        isLoading.value = false;
      }
    };

    const createCheckpointCategories = async (
      newsCategories: CheckpointCategoriesForm
    ) => {
      try {
        isLoading.value = true;
        const { data } = await api.post(
          "/checkpoint-categories",
          newsCategories
        );

        if (data) {
          await getAllCheckpointCategories();
          return data;
        }
      } catch (error) {
        console.error("❌ Failed to create :", error);
      } finally {
        isLoading.value = false;
      }
    };

    const updateCheckpointCategories = async (
      id: number,
      updatedData: Partial<CheckpointCategoriesForm>
    ) => {
      try {
        isLoading.value = true;
        const { data } = await api.put(
          `/checkpoint-categories/${id}`,
          updatedData
        );

        if (data) {
          await getAllCheckpointCategories();
          return data;
        }
      } catch (error) {
        console.error("❌ Failed to update :", error);
      } finally {
        isLoading.value = false;
      }
    };

    const deleteCheckpointCategories = async (id: number) => {
      try {
        isLoading.value = true;
        const res = await api.delete(`/checkpoint-categories/${id}`);
        if (res) {
          await getAllCheckpointCategories();
        }
      } catch (error) {
        console.log(error);
      } finally {
        isLoading.value = false;
      }
    };

    return {
      isLoading,
      checkpointCategories,
      currentCheckpointCategories,
      getAllCheckpointCategories,
      getCheckpointCategoriesById,
      createCheckpointCategories,
      updateCheckpointCategories,
      deleteCheckpointCategories,
    };
  }
);
