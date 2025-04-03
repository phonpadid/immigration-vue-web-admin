<script setup lang="ts">
import { reactive, ref } from "vue";
import { usebannerStore } from "../store/banner.store";
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
const activeTab = ref("1");
const isLoading = ref(false);
const selectedImage = ref<File | null>(null);
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);

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

// ฟังก์ชันเมื่อมีการอัปโหลดไฟล์
const handleFileUpload = (file: File) => {
  selectedImage.value = file;
  formData.image = file;
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

// ฟังก์ชันสำหรับการบันทึกข้อมูล
const handleSubmit = async () => {
  try {
    isLoading.value = true;

    // สร้าง FormData สำหรับส่งข้อมูล
    const bannerFormData = new FormData();

    // เพิ่มข้อมูลทั้งหมดลงใน FormData
    if (formData.image) {
      bannerFormData.append("image", formData.image);
    } else {
      // ตรวจสอบว่าจำเป็นต้องมีรูปภาพหรือไม่
      alert("ກະລຸເລືອກຮູບກ່ອນ");
      isLoading.value = false;
      return;
    }
    bannerFormData.append("link", formData.link);
    bannerFormData.append("is_private", formData.is_private ? "1" : "0");
    bannerFormData.append("start_time", formData.start_time);
    bannerFormData.append("end_time", formData.end_time);
    bannerFormData.append("lo_title", formData.lo_title);
    bannerFormData.append("lo_description", formData.lo_description);
    bannerFormData.append("en_title", formData.en_title);
    bannerFormData.append("en_description", formData.en_description);
    bannerFormData.append("zh_cn_title", formData.zh_cn_title);
    bannerFormData.append("zh_cn_description", formData.zh_cn_description);

    // ทำการบันทึกข้อมูล
    await bannerStore.createBanner(bannerFormData);
    alert("บันทึกข้อมูลสำเร็จ");

    // รีเซ็ตฟอร์ม
    resetForm();
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล:", error);
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
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
  formData.lo_title = "";
  formData.lo_description = "";
  formData.en_title = "";
  formData.en_description = "";
  formData.zh_cn_title = "";
  formData.zh_cn_description = "";
  startDate.value = null;
  endDate.value = null;
};
</script>

<template>
  <div class="container mx-auto p-4 mt-12">
    <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
      ເພີ່ມຂໍ້ມູນປ້າຍໂຄສະນາ
    </h2>

    <UiForm :model="formData">
      <Tab v-model="activeTab" :tabs="tabsConfig">
        <template #tab1>
          <UiFormItem label="ຫົວຂໍ້" name="lo_title">
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
          <UiFormItem label="ຫົວຂໍ້" name="en_name">
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
          <UiFormItem label="ຫົວຂໍ້" name="zh_cn_title">
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
