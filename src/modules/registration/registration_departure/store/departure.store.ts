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
  let currentRequest: Promise<void> | null = null;
  const filters = reactive<DepartureFilters>({});
  const getAllDeparture = async () => {
    // ถ้ามี request ที่กำลังทำงานอยู่ให้รอให้เสร็จก่อน
    if (currentRequest) {
      await currentRequest;
      return;
    }

    try {
      isLoading.value = true;
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          queryParams.append(key, value.toString());
        }
      });

      currentRequest = api
        .get(`/departure?${queryParams.toString()}`)
        .then(({ data }) => {
          if (data?.data && Array.isArray(data.data)) {
            departure.data = data.data;
            departure.total = data.total ?? 0;
          }
        })
        .catch((error) => {
          console.error("❌ Failed to fetch departure data", error);
          throw error;
        })
        .finally(() => {
          isLoading.value = false;
          currentRequest = null;
        });

      await currentRequest;
    } catch (error) {
      console.error("❌ Failed to fetch departure data", error);
    }
  };

  // ... other methods remain the same ...

  const setFilters = (newFilters: Partial<DepartureFilters>) => {
    Object.assign(filters, newFilters);
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
      await getDepartureById(Number(id));
      return data;
    } catch (error) {
      console.error("❌ Failed to verify departure", error);

      throw error;
    } finally {
      isVerifying.value = false;
    }
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
