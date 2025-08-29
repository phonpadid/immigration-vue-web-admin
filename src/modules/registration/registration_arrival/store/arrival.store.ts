import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { api } from "@/lib/axios";
import type { ArrivalPaginatedResponse } from "../interface/arrival.interface";
import { notification } from "ant-design-vue";

// Define a more specific type for arrival details
interface ArrivalDetail {
  id: number;
  entry_name: string;
  black_list: "available" | "unavailable";
  verification_code: string;
  verified_at: string | null;
  created_at: string;
  purpose:
    | "business"
    | "diplomatic"
    | "official"
    | "tourism"
    | "transit"
    | "visit";
  is_traveling_in_tour: string;
  traveling_by_type: "flight" | "car" | "bus";
  traveling_by_no: string;
  traveling_from: string;
  passport_information: {
    id: number;
    number: string;
    expiry_date: string;
    date_issue: string;
    place_issue: string;
    image: string;
    people_image: string;
  };
  visa_information: {
    id: number;
    number: string;
    visaCategory: string;
    date_issue: string;
    place_issue: string;
    image: string;
  };
  verified_by_user: {
    id: number;
    email: string;

    profile: {
      image: string;
      first_name: string;
      last_name: string;
    };
  };

  personal_information: {
    name: string;
    family_name: string;
    date_of_birth: string;
    place_of_birth: string;
    gender: "male" | "female";
    nationality: string;
    race: string;
    occupation: string;
    phone_number: string;
  };
  intended_address?: Array<{
    name: string;
    village: string;
    district: string;
    province: string;
    check_in: string;
    check_out: string;
  }>;
}

export const useArrivalStore = defineStore("arrival", () => {
  // States
  const isLoading = ref(false);
  const isDetailLoading = ref(false);
  const isVerifying = ref(false);

  const arrival = reactive<{
    data: ArrivalPaginatedResponse[];
    total: number;
    meta?: any;
  }>({
    data: [],
    total: 0,
    meta: null,
  });

  const currentArrival = ref<ArrivalDetail | null>(null);

  const filters = reactive({
    entry_name: "",
    passport_number: "",
    visa_number: "",
    black_list: "",
    is_verified: "",
    verification_code: "",
    offset: 0,
    limit: 10,
  });

  const resetFilters = () => {
    filters.entry_name = "";
    filters.passport_number = "";
    filters.visa_number = "";
    filters.black_list = "";
    filters.is_verified = "";
    filters.verification_code = "";
    filters.offset = 0;
    filters.limit = 10; 
    
  };

  let currentRequest: Promise<void> | null = null;

  const getAllArrival = async () => {
    // ถ้ากำลังโหลดอยู่ให้รอให้เสร็จก่อน
    if (currentRequest) {
      await currentRequest;
      return;
    }

    try {
      isLoading.value = true;

      // สร้าง query string
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          queryParams.append(key, value.toString());
        }
      });

      // เก็บ reference ของ request ปัจจุบัน
      currentRequest = api
        .get(`/arrival?${queryParams.toString()}`)
        .then(({ data }) => {
          if (data?.data && Array.isArray(data.data)) {
            arrival.data = data.data;
            arrival.total = data.total ?? 0;
            arrival.meta = data.meta ?? null;
          }
        })
        .catch((error) => {
          console.error("❌ Failed to fetch arrivals", error);
          notification.error({
            message: "ຂໍ້ຜິດພາດ",
            description: "ບໍ່ສາມາດດຶງຂໍ້ມູນການເຂົ້າເມືອງໄດ້",
          });
          throw error;
        })
        .finally(() => {
          isLoading.value = false;
          currentRequest = null;
        });

      await currentRequest;
    } catch (error) {
      // Error handling is done in the promise chain above
    }
  };

  const setFilters = (newFilters: Partial<typeof filters>) => {
    Object.assign(filters, newFilters);
  };

  // Function to fetch arrival details
  const getArrivalById = async (id: string | number, forceReload = false) => {
    if (!forceReload && !shouldLoadArrival(id)) {
      return currentArrival.value;
    }
    try {
      isDetailLoading.value = true;
      const { data } = await api.get(`/arrival/${id}`);
      currentArrival.value = data;
      return data;
    } catch (error) {
      console.error("❌ Failed to fetch arrival details", error);
      notification.error({
        message: "ຂໍ້ຜິດພາດ",
        description: "ບໍ່ສາມາດດຶງຂໍ້ມູນການເຂົ້າເມືອງໄດ້",
      });
      return null;
    } finally {
      isDetailLoading.value = false;
    }
  };

  // Function to verify arrival
  const verifyArrival = async (id: string | number) => {
    try {
      isVerifying.value = true;
      await api.put(`/arrival/${id}`);
      // Refresh data after verification
      await getArrivalById(id, true);
      return true;
    } catch (error) {
      console.error("❌ Failed to verify arrival", error);
      notification.error({
        message: "ຂໍ້ຜິດພາດ",
        description: "ບໍ່ສາມາດຢືນຢັນການເຂົ້າເມືອງໄດ້",
      });
      return false;
    } finally {
      isVerifying.value = false;
    }
  };

  // Helper functions for display purposes
  const getPurposeLabel = (
    purpose:
      | "business"
      | "diplomatic"
      | "official"
      | "tourism"
      | "transit"
      | "visit"
  ): string => {
    const purposeMap = {
      business: "ທຸລະກິດ",
      diplomatic: "ການທູດ",
      official: "ທາງການ",
      tourism: "ການທ່ອງທ່ຽວ",
      transit: "ການໂດຍສານ",
      visit: "ຢ້ຽມຢາມ",
    };
    return purposeMap[purpose] || purpose;
  };

  const getTravelTypeLabel = (type: "flight" | "car" | "bus"): string => {
    const typeMap = {
      flight: "ທ່ຽວບິນ",
      car: "ລົດສ່ວນຕົວ",
      bus: "ລົດເມ",
    };
    return typeMap[type] || type;
  };

  const getGenderLabel = (gender: string): string => {
    return gender === "male" ? "ຊາຍ" : gender === "female" ? "ຍົງ" : gender;
  };

  const shouldLoadArrival = (id: string | number) => {
    return (
      !currentArrival.value ||
      currentArrival.value.id.toString() !== id.toString()
    );
  };

  const scanArrival = async (verification_code: string) => {
    try {
      isLoading.value = true;

      // เรียก API scan
      const { data } = await api.post("/arrival/scan", {
        verification_code: verification_code,
      });

      if (data?.id) {
        // ดึงข้อมูลรายละเอียดทันที
        const detailResponse = await api.get(`/arrival/${data.id}`);
        currentArrival.value = detailResponse.data;

        return {
          id: data.id,
          details: detailResponse.data,
        };
      }

      throw new Error("ບໍ່ພົບຂໍ້ມູນ");
    } catch (error: any) {
      console.error("❌ Failed to scan arrival QR code", error);
      const errorMessage =
        error.response?.data?.message || "ບໍ່ສາມາດສະແກນ QR Code ໄດ້";
      notification.error({
        message: "ຂໍ້ຜິດພາດ",
        description: errorMessage,
      });
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    isDetailLoading,
    isVerifying,
    arrival,
    currentArrival,
    filters,
    getAllArrival,
    getArrivalById,
    verifyArrival,
    setFilters,
    resetFilters,
    getPurposeLabel,
    getTravelTypeLabel,
    getGenderLabel,
    scanArrival,
  };
});
