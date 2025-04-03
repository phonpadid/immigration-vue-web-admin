<script setup lang="ts">
import { reactive, ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useNotification } from "@/utils/notificationService";
import { popupsStore } from "../store/popup.store";
import type { PopupFormCreate } from "../interface/popup.interface";
import UiButton from "@/components/button/UiButton.vue";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiInput from "@/components/Input/UiInput.vue";
import Switch from "@/components/Switch/Switch.vue";
import UploadDragger from "@/components/Upload/UploadDragger.vue";
import DatePicker from "@/components/Datepicker/DatePicker.vue";
import dayjs from "dayjs";

// Configure dayjs to use custom parsing
dayjs.extend(customParseFormat);

const { openNotification } = useNotification();
const { updatePopup, getPopupsId } = popupsStore();
const route = useRoute();
const router = useRouter();
const isLoading = ref(false);
const selectedImage = ref<File | null>(null);
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
const imageBaseUrl = import.meta.env.VITE_IMG_URL;
const IMAGE_MAX_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

const formData = reactive<PopupFormCreate>({
  image: null,
  link: "",
  is_private: false,
  start_time: "",
  end_time: "",
  existingImage: "",
});

const fullImageUrl = computed(() => {
  return formData.existingImage
    ? `${imageBaseUrl}/${formData.existingImage}`
    : "";
});

const formatDateFromApi = (dateString: string | null): string => {
  if (!dateString) return "";
  return dayjs(dateString).format("MM-DD-YYYY");
};

// แก้ไขวิธีการจัดการกับการเปลี่ยนแปลงวันที่
const handleDateChange = (dateRange: {
  startDate: string;
  endDate: string;
}) => {
  console.log("DateRange received:", dateRange);

  if (dateRange.startDate) {
    // Format to MM-DD-YYYY
    const formattedStartDate = dayjs(dateRange.startDate).format("MM-DD-YYYY");
    startDate.value = formattedStartDate;
    formData.start_time = formattedStartDate;
    console.log("Set start_time:", formattedStartDate);
  }

  if (dateRange.endDate) {
    // Format to MM-DD-YYYY
    const formattedEndDate = dayjs(dateRange.endDate).format("MM-DD-YYYY");
    endDate.value = formattedEndDate;
    formData.end_time = formattedEndDate;
    console.log("Set end_time:", formattedEndDate);
  }
};

const loadPopupData = async () => {
  try {
    isLoading.value = true;
    const id = Number(route.params.id);
    if (!id) throw new Error("Invalid ID");

    const data = await getPopupsId(id);
    console.log("API Response:", data);

    if (data) {
      formData.link = data.link || "";
      formData.is_private = data.is_private === false;
      formData.existingImage = data.image || "";

      if (data.start_time) {
        // จัดรูปแบบวันที่จาก API
        const formattedStartDate = formatDateFromApi(data.start_time);
        // console.log("Formatted start_time:", formattedStartDate);
        formData.start_time = formattedStartDate;
        // สำคัญ: อัปเดต ref startDate เพื่อใช้ใน v-model
        startDate.value = formattedStartDate;
      }

      if (data.end_time) {
        // จัดรูปแบบวันที่จาก API
        const formattedEndDate = formatDateFromApi(data.end_time);
        // console.log("Formatted end_time:", formattedEndDate);
        formData.end_time = formattedEndDate;
        // สำคัญ: อัปเดต ref endDate เพื่อใช้ใน v-model
        endDate.value = formattedEndDate;
      }
    }
  } catch (error: any) {
    console.error("Error loading data:", error);
    openNotification(
      "error",
      "ຜິດພາດ",
      error.message || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ"
    );
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;

    if (!validateDates()) {
      return;
    }

    const id = Number(route.params.id);
    const formattedData = {
      ...formData,
      is_private: formData.is_private ? 1 : 0,
    };

    await updatePopup(id, formattedData);
    openNotification("success", "ສຳເລັດ", "ແກ້ໄຂຂໍ້ມູນສຳເລັດ");
    router.push({ name: "popups" });
  } catch (error: any) {
    openNotification(
      "error",
      "ຜິດພາດ",
      error.message || "ເກີດຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນ"
    );
  } finally {
    isLoading.value = false;
  }
};

const validateDates = (): boolean => {
  if (!formData.start_time || !formData.end_time) {
    openNotification(
      "error",
      "ຜິດພາດ",
      "ກະລຸນາເລືອກວັນທີເລີ່ມຕົ້ນ ແລະ ວັນທີສິ້ນສຸດ"
    );
    return false;
  }

  // Use MM-DD-YYYY format for validation
  const start = dayjs(formData.start_time, "MM-DD-YYYY");
  const end = dayjs(formData.end_time, "MM-DD-YYYY");

  if (!start.isValid() || !end.isValid()) {
    openNotification("error", "ຜິດພາດ", "ຮູບແບບວັນທີບໍ່ຖືກຕ້ອງ");
    return false;
  }

  if (end.isBefore(start)) {
    openNotification(
      "error",
      "ຜິດພາດ",
      "ວັນທີສິ້ນສຸດຕ້ອງຫຼັງຈາກວັນທີເລີ່ມຕົ້ນ"
    );
    return false;
  }

  return true;
};

const handleFileSelect = (file: File) => {
  // Reset previous selection
  selectedImage.value = null;
  formData.image = null;

  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    openNotification(
      "error",
      "Invalid File Type",
      "Please upload a valid image (JPEG, PNG, GIF)"
    );
    return;
  }

  // Validate file size
  if (file.size > IMAGE_MAX_SIZE) {
    openNotification(
      "error",
      "File Too Large",
      "Image must be less than 100MB"
    );
    return;
  }

  // If validation passes
  selectedImage.value = file;
  formData.image = file;
};

// Load data when component mounts
onMounted(() => {
  loadPopupData();
});
</script>

<template>
  <div class="container mx-auto p-4 mt-12">
    <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
      ແກ້ໄຂຂໍ້ມູນປ໋ອບອັບ
    </h2>

    <UiForm :model="formData">
      <div class="col-span-2">
        <UploadDragger
          :existing-image-url="fullImageUrl"
          @onFileSelect="handleFileSelect"
        />
      </div>
      <div>
        <div>
          <div class="grid gap-4 my-4 md:grid-cols-2 md:gap-6">
            <UiFormItem label="ລິ້ງ" name="link">
              <UiInput v-model="formData.link" placeholder="ກະລຸນາປ້ອນລິ້ງ" />
            </UiFormItem>
            <Switch
              v-model="formData.is_private"
              label="ການມອງເຫັນ"
              name="is_private"
            />
          </div>
        </div>
        <div class="grid gap-4 my-4 md:grid-cols-2 md:gap-6">
          <div class="col-span-2">
            <DatePicker
              v-model:modelValueStart="startDate"
              v-model:modelValueEnd="endDate"
              display-format="DD/MM/YYYY"
              date-format="MM-DD-YYYY"
              @change="handleDateChange"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-4">
        <UiButton
          @click="handleSubmit"
          type="submit"
          size="large"
          :loading="isLoading"
          colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
        >
          ແກ້ໄຂຂໍ້ມູນ
        </UiButton>
      </div>
    </UiForm>
  </div>
</template>
