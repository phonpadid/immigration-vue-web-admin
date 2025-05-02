import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type { Checkpoint, CheckpointResponse } from "@/types/checkpoint.type";

export const useCheckpointStore = defineStore("checkpoint", () => {
  // State with proper typing
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const checkpoints = reactive<CheckpointResponse>({
    data: [],
    total: 0,
  });
  const currentCheckpoint = ref<Checkpoint | null>(null);

  // Error handling utility
  const handleError = (err: any, defaultMessage: string): never => {
    const errorMessage = err.response?.data?.message || defaultMessage;
    error.value = errorMessage;
    console.error(`❌ ${defaultMessage}:`, err);
    throw new Error(errorMessage);
  };

  // GET all checkpoints
  const getAllCheckpoints = async (
    params: {
      offset?: number;
      limit?: number;
      categoryId?: number;
      provinceId?: number;
    } = {}
  ) => {
    try {
      isLoading.value = true;
      error.value = null;

      const queryParams = new URLSearchParams({
        offset: (params.offset ?? 0).toString(),
        limit: (params.limit ?? 10).toString(),
        ...(params.categoryId && { category_id: params.categoryId.toString() }),
        ...(params.provinceId && { province_id: params.provinceId.toString() }),
      });

      const { data } = await api.get(`/checkpoint?${queryParams}`);

      if (data?.data) {
        checkpoints.data = data.data;
        checkpoints.total = data.total;
      }
    } catch (err: any) {
      handleError(err, "Failed to fetch checkpoints");
    } finally {
      isLoading.value = false;
    }
  };

  // GET checkpoint by ID
  const getCheckpointById = async (id: number): Promise<Checkpoint | null> => {
    try {
      isLoading.value = true;
      error.value = null;

      const { data } = await api.get(`/checkpoint/${id}`);
      currentCheckpoint.value = data;
      return data;
    } catch (err: any) {
      handleError(err, "Failed to fetch checkpoint details");
    } finally {
      isLoading.value = false;
    }
    return null;
  };

  // CREATE new checkpoint
  const createCheckpoint = async (
    formData: FormData
  ): Promise<Checkpoint | null> => {
    try {
      isLoading.value = true;
      error.value = null;

      const { data } = await api.post("/checkpoint", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await getAllCheckpoints();
      return data;
    } catch (err: any) {
      handleError(err, "Failed to create checkpoint");
    } finally {
      isLoading.value = false;
    }
    return null;
  };

  // UPDATE checkpoint
  const updateCheckpoint = async (
    id: number,
    formData: FormData
  ): Promise<Checkpoint | null> => {
    try {
      isLoading.value = true;
      error.value = null;

      const { data } = await api.put(`/checkpoint/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await getAllCheckpoints();
      return data;
    } catch (err: any) {
      handleError(err, "Failed to update checkpoint");
    } finally {
      isLoading.value = false;
    }
    return null;
  };

  // DELETE checkpoint
  const deleteCheckpoint = async (id: number): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      await api.delete(`/checkpoint/${id}`);
      await getAllCheckpoints();
      return true;
    } catch (err: any) {
      handleError(err, "Failed to delete checkpoint");
    } finally {
      isLoading.value = false;
    }
    return false;
  };

  return {
    // State
    isLoading,
    error,
    checkpoints,
    currentCheckpoint,

    // Actions
    getAllCheckpoints,
    getCheckpointById,
    createCheckpoint,
    updateCheckpoint,
    deleteCheckpoint,
  };
});
