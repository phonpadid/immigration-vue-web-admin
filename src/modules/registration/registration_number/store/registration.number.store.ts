import { buildFormData } from "@/utils/FuntionFormData";
import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type { NumberResponse } from "../interface/registration.number.interface";

export const useRegistrationnumberStore = defineStore(
  "Registration-number",
  () => {
    const isLoading = ref(false);
    const registartion = reactive<{ data: NumberResponse[]; total: number }>({
      data: [],
      total: 0,
    });
    const currentRegistrationNumber = ref<NumberResponse | null>(null);
    /***************************************************************** */
    const getRegiter_enter = async (): Promise<NumberResponse> => {
      try {
        isLoading.value = true;
        const { data } = await api.get("/no-of-register/enter");
        return {
          per_day: data?.per_day ?? 0,
          per_mouth: data?.per_mouth ?? 0,
          per_year: data?.per_year ?? 0,
        };
      } catch (error) {
        console.error("❌ Failed to fetch :", error);
        return {
          per_day: 0,
          per_mouth: 0,
          per_year: 0,
        };
      } finally {
        isLoading.value = false;
      }
    };

    const getRegiter_exit = async (): Promise<NumberResponse> => {
      try {
        isLoading.value = true;
        const { data } = await api.get("/no-of-register/exit");

        return {
          per_day: data?.per_day ?? 0,
          per_mouth: data?.per_mouth ?? 0,
          per_year: data?.per_year ?? 0,
        };
      } catch (error) {
        console.error("❌ Failed to fetch exit data:", error);
        return {
          per_day: 0,
          per_mouth: 0,
          per_year: 0,
        };
      } finally {
        isLoading.value = false;
      }
    };
    /***************************************************************** */
    const getTourists_enter = async (): Promise<NumberResponse> => {
      try {
        isLoading.value = true;
        const { data } = await api.get("/no-of-tourists/enter");

        return {
          per_day: data?.per_day ?? 0,
          per_mouth: data?.per_mouth ?? 0,
          per_year: data?.per_year ?? 0,
        };
      } catch (error) {
        console.error("❌ Failed to fetch exit data:", error);
        return {
          per_day: 0,
          per_mouth: 0,
          per_year: 0,
        };
      } finally {
        isLoading.value = false;
      }
    };
    const getTourists_exit = async (): Promise<NumberResponse> => {
      try {
        isLoading.value = true;
        const { data } = await api.get("/no-of-tourists/exit");

        return {
          per_day: data?.per_day ?? 0,
          per_mouth: data?.per_mouth ?? 0,
          per_year: data?.per_year ?? 0,
        };
      } catch (error) {
        console.error("❌ Failed to fetch exit data:", error);
        return {
          per_day: 0,
          per_mouth: 0,
          per_year: 0,
        };
      } finally {
        isLoading.value = false;
      }
    };
    /***************************************************************** */

    const incrementRegisterEnter = async (value: number): Promise<void> => {
      try {
        isLoading.value = true;
        await api.post("/no-of-register/enter/increment", {
          number: value,
        });
        await getRegiter_enter();
      } catch (error) {
        console.error("❌ Failed to increment register:", error);
        throw error;
      } finally {
        isLoading.value = false;
      }
    };

    const decrementRegisterEnter = async (value: number): Promise<void> => {
      try {
        isLoading.value = true;
        await api.post("/no-of-register/enter/decrement", {
          number: value,
        });
        await getRegiter_enter();
      } catch (error) {
        console.error("❌ Failed to decrement register:", error);
        throw error;
      } finally {
        isLoading.value = false;
      }
    };
    /***************************************************************** */
    const incrementRegisterExit = async (value: number): Promise<void> => {
      try {
        isLoading.value = true;
        await api.post("/no-of-register/exit/increment", {
          number: value,
        });
      } catch (error) {
        console.error("❌ Failed to increment exit register:", error);
        throw error;
      } finally {
        isLoading.value = false;
      }
    };

    const decrementRegisterExit = async (value: number): Promise<void> => {
      try {
        isLoading.value = true;
        await api.post("/no-of-register/exit/decrement", {
          number: value,
        });
      } catch (error) {
        console.error("❌ Failed to decrement exit register:", error);
        throw error;
      } finally {
        isLoading.value = false;
      }
    };

    /***************************************************************** */
    const incrementTouristsEnter = async (value: number): Promise<void> => {
      try {
        isLoading.value = true;
        await api.post("/no-of-tourists/enter/increment", {
          number: value,
        });
      } catch (error) {
        console.error("❌ Failed to increment tourists enter:", error);
        throw error;
      } finally {
        isLoading.value = false;
      }
    };

    const decrementTouristsEnter = async (value: number): Promise<void> => {
      try {
        isLoading.value = true;
        await api.post("/no-of-tourists/enter/decrement", {
          number: value,
        });
      } catch (error) {
        console.error("❌ Failed to decrement tourists enter:", error);
        throw error;
      } finally {
        isLoading.value = false;
      }
    };
    /***************************************************************** */

    const incrementTouristsExit = async (value: number): Promise<void> => {
      try {
        isLoading.value = true;
        await api.post("/no-of-tourists/exit/increment", {
          number: value,
        });
      } catch (error) {
        console.error("❌ Failed to increment tourists exit:", error);
        throw error;
      } finally {
        isLoading.value = false;
      }
    };

    const decrementTouristsExit = async (value: number): Promise<void> => {
      try {
        isLoading.value = true;
        await api.post("/no-of-tourists/exit/decrement", {
          number: value,
        });
      } catch (error) {
        console.error("❌ Failed to decrement tourists exit:", error);
        throw error;
      } finally {
        isLoading.value = false;
      }
    };
    /***************************************************************** */

    return {
      isLoading,
      registartion,
      currentRegistrationNumber,
      getRegiter_enter,
      getRegiter_exit,
      getTourists_enter,
      getTourists_exit,
      incrementRegisterEnter,
      decrementRegisterEnter,
      incrementRegisterExit,
      decrementRegisterExit,
      incrementTouristsEnter,
      decrementTouristsEnter,
      incrementTouristsExit,
      decrementTouristsExit,
    };
  }
);
