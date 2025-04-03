<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useNotification } from "@/utils/notificationService";
import { popupsStore } from "../store/popup.store";
import type { PopupFormCreate } from "../interface/popup.interface";
import UiButton from "@/components/button/UiButton.vue";
import dayjs from "dayjs";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiInput from "@/components/Input/UiInput.vue";
import Switch from "@/components/Switch/Switch.vue";
import UploadDragger from "@/components/Upload/UploadDragger.vue";
import DatePicker from "@/components/Datepicker/DatePicker.vue";

// Configure dayjs to use custom parsing
dayjs.extend(customParseFormat);

const { createPopup } = popupsStore();
const { openNotification } = useNotification();
const { push } = useRouter();
const isLoading = ref(false);
const selectedImage = ref<File | null>(null);
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);

const formData = reactive<PopupFormCreate>({
  image: null,
  link: "",
  is_private: false,
  start_time: "",
  end_time: "",
});

const handleFileUpload = (file: File) => {
  selectedImage.value = file;
  formData.image = file;
};

const formatDate = (date: string): string => {
  return dayjs(date).format("MM-DD-YYYY");
};

const handleDateChange = (dateRange: {
  startDate: string;
  endDate: string;
}) => {
  // Format dates to MM-DD-YYYY
  const formattedStartDate = formatDate(dateRange.startDate);
  const formattedEndDate = formatDate(dateRange.endDate);

  startDate.value = formattedStartDate;
  endDate.value = formattedEndDate;
  formData.start_time = formattedStartDate;
  formData.end_time = formattedEndDate;
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

  // Parse dates using the correct format
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

const handleSubmit = async () => {
  try {
    isLoading.value = true;

    // Validation
    if (!formData.image) {
      openNotification("error", "ຜິດພາດ", "ກະລຸນາອັບໂຫລດຮູບພາບ");
      return;
    }

    if (!validateDates()) {
      return;
    }

    await createPopup(formData);
    openNotification("success", "ສຳເລັດ", "ບັນທຶກຂໍ້ມູນສຳເລັດ");
    push({ name: "popups" });
  } catch (error: any) {
    openNotification(
      "error",
      "ຜິດພາດ",
      error.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ"
    );
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  formData.image = null;
  formData.link = "";
  formData.is_private = false;
  formData.start_time = "";
  formData.end_time = "";
  startDate.value = null;
  endDate.value = null;
};
</script>

<template>
  <div class="container mx-auto p-4 mt-12">
    <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
      ເພີ່ມຂໍ້ມູນປ໋ອບອັບ
    </h2>
    <UiForm :model="formData">
      <div class="col-span-2">
        <UploadDragger
          v-model:fileList="formData.image"
          @onFileSelect="handleFileUpload"
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
              @change="handleDateChange"
            />
          </div>
        </div>
      </div>

      <UiButton
        @click="handleSubmit"
        type="submit"
        size="large"
        :loading="isLoading"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
      >
        ເພີ່ມຂໍ້ມູນ
      </UiButton>
    </UiForm>
  </div>
</template>
