<script setup lang="ts">
import { reactive, ref } from "vue";
import { useNotification } from "@/utils/notificationService";
import { usebannerStore } from "../store/banner.store";
import { useRouter } from "vue-router";
import type { ValidateMessages } from "ant-design-vue/es/form/interface";
import UiButton from "@/components/button/UiButton.vue";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiInput from "@/components/Input/UiInput.vue";
import Textarea from "@/components/Input/Textarea.vue";
import Tab from "@/components/Tab/Tab.vue";
import Switch from "@/components/Switch/Switch.vue";
import UploadDragger from "@/components/Upload/UploadDragger.vue";
import DatePicker from "@/components/Datepicker/DatePicker.vue";

const bannerStore = usebannerStore();
const { openNotification } = useNotification();
const router = useRouter();
const formRef = ref<InstanceType<typeof UiForm>>();
const activeTab = ref("1");
const selectedImage = ref<FileItem | null>(null);
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
const validationErrors = ref<string[]>([]);
interface FileItem {
  file: File;
}
const formData = reactive({
  image: null as File | null,
  link: "",
  is_private: false,
  start_time: "",
  end_time: "",
  lo_title: "",
  lo_description: "",
  en_title: "",
  en_description: "",
  zh_cn_title: "",
  zh_cn_description: "",
});

const tabsConfig = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3" },
];

const hasUploadedImage = ref(false);

const handleFileUpload = (file: File) => {
  selectedImage.value = { file };
  formData.image = file;
  hasUploadedImage.value = true;
};
const validateMessages: ValidateMessages = {
  default: "ກະລຸນາກວດສອບຂໍ້ມູນ",
  required: "${label} ຈະຕ້ອງບໍ່ຫວ່າງເປົ່າ.",
  string: {
    min: "${label} ຕ້ອງມີຢ່າງໜ້ອຍ ${min} ຕົວອັກສອນ",
  },
  types: {
    url: "ກະລຸນາປ້ອນລິ້ງໃຫ້ຖືກຕ້ອງ",
  },
};

// ฟังก์ชันเมื่อมีการเลือกวันที่
const handleDateChange = (dateRange: {
  startDate: string;
  endDate: string;
}) => {
  startDate.value = dateRange.startDate;
  endDate.value = dateRange.endDate;
  formData.start_time = dateRange.startDate;
  formData.end_time = dateRange.endDate;
};

const isSubmitting = ref(false);
const validateForm = async (): Promise<boolean> => {
  try {
    validationErrors.value = [];
    let isValid = true;

    if (!formRef.value) {
      throw new Error("ບໍ່ພົບຂໍ້ມູນແບບຟອມ");
    }

    // ตรวจสอบรูปภาพด้วย selectedImage แทน formData.image
    if (!selectedImage.value && !hasUploadedImage.value) {
      validationErrors.value.push("ກະລຸນາເລືອກຮູບພາບ");

      isValid = false;
    }

    if (!formData.start_time || !formData.end_time) {
      validationErrors.value.push("ກະລຸນາເລືອກວັນທີເລີ່ມຕົ້ນ ແລະ ວັນທີສິ້ນສຸດ");
      isValid = false;
    }

    try {
      await formRef.value.validate();
    } catch (formError: any) {
      isValid = false;
    }

    return isValid;
  } catch (error: any) {
    console.error("Form validation errors:", error);

    return false;
  }
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;

    const isValid = await validateForm();
    if (!isValid) {
      isSubmitting.value = false;
      return;
    }
    const bannerFormData = new FormData();
    if (selectedImage.value?.file) {
      bannerFormData.append("image", selectedImage.value.file);
    } else {
      throw new Error("ກະລຸນາອັບໂຫລດຮູບພາບໃນສ່ວນສໍາລັບແບນເນີ");
    }
    bannerFormData.append("link", formData.link?.trim() || "");
    bannerFormData.append("is_private", formData.is_private ? "1" : "0");
    bannerFormData.append("start_time", formData.start_time);
    bannerFormData.append("end_time", formData.end_time);
    bannerFormData.append("lo_title", formData.lo_title?.trim() || "");
    bannerFormData.append(
      "lo_description",
      formData.lo_description?.trim() || ""
    );
    bannerFormData.append("en_title", formData.en_title?.trim() || "");
    bannerFormData.append(
      "en_description",
      formData.en_description?.trim() || ""
    );
    bannerFormData.append("zh_cn_title", formData.zh_cn_title?.trim() || "");
    bannerFormData.append(
      "zh_cn_description",
      formData.zh_cn_description?.trim() || ""
    );

    await bannerStore.createBanner(bannerFormData);
    router.push({ name: "banners" });
    openNotification("success", "ສໍາເລັດ", "ບັນທຶກຂໍ້ມູນແລ້ວ");
    resetForm();
  } catch (error: any) {
    console.error("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ:", error);
    openNotification("error", "ແຈ້ງເຕືອນ", error);
  } finally {
    isSubmitting.value = false;
  }
};
const resetForm = () => {
  formData.image = null;
  formData.link = "";
  formData.is_private = false;
  formData.start_time = "";
  formData.end_time = "";
  formData.lo_title = "";
  formData.lo_description = "";
  formData.en_title = "";
  formData.en_description = "";
  formData.zh_cn_title = "";
  formData.zh_cn_description = "";
  startDate.value = null;
  endDate.value = null;
  hasUploadedImage.value = false;
};
</script>

<template>
  <div class="container mx-auto p-4 mt-12">
    <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
      ເພີ່ມຂໍ້ມູນປ້າຍໂຄສະນາ
    </h2>

    <UiForm
      ref="formRef"
      :model="formData"
      :validate-messages="validateMessages"
    >
      <Tab v-model="activeTab" :tabs="tabsConfig">
        <template #tab1>
          <UiFormItem label="ຫົວຂໍ້" name="lo_title" required>
            <UiInput
              v-model="formData.lo_title"
              placeholder="ປ້ອນຫົວຂ້ໍ້"
              allowClear
              size="large"
            />
          </UiFormItem>
          <UiFormItem label="ຄຳອະທິບາຍ" name="lo_description">
            <Textarea
              v-model="formData.lo_description"
              placeholder="ປ້ອນຄຳອະທິບາຍ"
              name="lo_description"
            />
          </UiFormItem>
        </template>
        <template #tab2>
          <UiFormItem label="ຫົວຂໍ້" name="en_title" required>
            <UiInput
              v-model="formData.en_title"
              placeholder="ປ້ອນຫົວຂໍ້"
              allowClear
              size="large"
            />
          </UiFormItem>
          <UiFormItem label="ຄຳອະທິບາຍ" name="en_description">
            <Textarea
              v-model="formData.en_description"
              placeholder="ປ້ອນຄຳອະທິບາຍ"
              name="en-description"
            />
          </UiFormItem>
        </template>
        <template #tab3>
          <UiFormItem label="ຫົວຂໍ້" name="zh_cn_title" required>
            <UiInput
              v-model="formData.zh_cn_title"
              placeholder="ປ້ອນຫົວຂໍ້"
              allowClear
              size="large"
            />
          </UiFormItem>
          <UiFormItem label="ຄຳອະທິບາຍ" name="zh_cn_description">
            <Textarea
              v-model="formData.zh_cn_description"
              placeholder="ປ້ອນຄຳອະທິບາຍ"
              name="zh_cn_description"
            />
          </UiFormItem>
        </template>
      </Tab>
      <UiFormItem label="ຮູບພາບ" name="image" class="col-span-2">
        <UploadDragger
          v-model:fileList="formData.image"
          @onFileSelect="handleFileUpload"
        />
      </UiFormItem>
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
            <UiFormItem label="ເວລາເລີມຕົ້ນ ແລະ ເວລາສິນສຸດ" required
              ><DatePicker
                v-model:modelValueStart="startDate"
                v-model:modelValueEnd="endDate"
                @change="handleDateChange"
            /></UiFormItem>
          </div>
        </div>
      </div>

      <UiButton
        @click="handleSubmit"
        type="submit"
        size="large"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
      >
        {{ isSubmitting ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ" }}
      </UiButton>
    </UiForm>
  </div>
</template>
