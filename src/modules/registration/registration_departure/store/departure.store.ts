import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type {
  DeparturePaginatedResponse,
  DepartureFilters,
} from "../interface/departure.interface";

export const useDepartureStore = defineStore("departure", () => {
  const isLoading = ref(false);
  const isVerifying = ref(false);
  const departure = reactive<{
    data: DeparturePaginatedResponse[];
    total: number;
  }>({
    data: [],
    total: 0,
  });
  const currentDeparture = ref<DeparturePaginatedResponse | null>(null);
  const filters = reactive<DepartureFilters>({});

  const getAllDeparture = async () => {
    try {
      isLoading.value = true;
      const queryParams = new URLSearchParams();

      // Add all filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          queryParams.append(key, value.toString());
        }
      });

      const { data } = await api.get(`/departure?${queryParams.toString()}`);

      if (data?.data && Array.isArray(data.data)) {
        departure.data = data.data;
        departure.total = data.total ?? 0;
      }
    } catch (error) {
      console.error("❌ Failed to fetch departure data", error);
    } finally {
      isLoading.value = false;
    }
  };

  const getDepartureById = async (id: number) => {
    try {
      isLoading.value = true;
      const { data } = await api.get(`/departure/${id}`);
      currentDeparture.value = data;
      return data;
    } catch (error) {
      console.error("❌ Failed to fetch departure details", error);
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  const verifyDeparture = async (id: string | number) => {
    try {
      isVerifying.value = true;
      const { data } = await api.put(`/departure/${id}`, {
        verified_at: new Date().toISOString(),
      });

      // อัพเดทข้อมูลใน store
      if (
        currentDeparture.value &&
        currentDeparture.value.id.toString() === id.toString()
      ) {
        currentDeparture.value = {
          ...currentDeparture.value,
          verified_at: data.verified_at,
        };
      }

      // อัพเดทข้อมูลในลิสต์หลักด้วย
      const index = departure.data.findIndex(
        (item) => item.id.toString() === id.toString()
      );
      if (index !== -1) {
        departure.data[index] = {
          ...departure.data[index],
          verified_at: data.verified_at,
        };
      }

      return data;
    } catch (error) {
      console.error("❌ Failed to verify departure", error);
      throw error;
    } finally {
      isVerifying.value = false;
    }
  };

  const setFilters = (newFilters: DepartureFilters) => {
    Object.assign(filters, newFilters);
  };

  return {
    isLoading,
    departure,
    currentDeparture,
    filters,
    isVerifying,
    verifyDeparture,
    getAllDeparture,
    getDepartureById,
    setFilters,
  };
});
