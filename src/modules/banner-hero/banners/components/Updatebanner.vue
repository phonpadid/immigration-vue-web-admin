<script setup lang="ts">
import { reactive, ref, onMounted, computed } from "vue";
import { usebannerStore } from "../store/banner.store";
import { useRoute, useRouter } from "vue-router";
import { useNotification } from "@/utils/notificationService";
import { Modal } from "ant-design-vue";
import UiButton from "@/components/button/UiButton.vue";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiInput from "@/components/Input/UiInput.vue";
import Textarea from "@/components/Input/Textarea.vue";
import Tab from "@/components/Tab/Tab.vue";
import Switch from "@/components/Switch/Switch.vue";
import UploadDragger from "@/components/Upload/UploadDragger.vue";
import DatePicker from "@/components/Datepicker/DatePicker.vue";
import dayjs from "dayjs";
/************************************************************* */
const route = useRoute();
const { push } = useRouter();
const bannerStore = usebannerStore();
const activeTab = ref("1");
const isLoading = ref(false);
const selectedImage = ref<File | null>(null);
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
const bannerId = ref<number>(Number(route.params.id));
const { openNotification } = useNotification();
const imageBaseUrl = import.meta.env.VITE_IMG_URL;
const IMAGE_MAX_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

// Added translation IDs to the form data
const formData = reactive({
  image: null as File | null,
  link: "",
  is_private: false,
  start_time: "",
  end_time: "",
  lo_title: "",
  lo_description: "",
  lo_id: 0, // Added for Lao translation ID
  en_title: "",
  en_description: "",
  en_id: 0, // Added for English translation ID
  zh_cn_title: "",
  zh_cn_description: "",
  zh_cn_id: 0, // Added for Chinese translation ID
  existingImage: "",
});
const tabsConfig = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3" },
];
const fullImageUrl = computed(() => {
  return formData.existingImage
    ? `${imageBaseUrl}/${formData.existingImage}`
    : "";
});

const formatDateForApi = (dateString: string | null): string => {
  if (!dateString) return "";
  return dayjs(dateString).format("MM-DD-YYYY"); // เปลี่ยนเป็น  MM-DD-YYYY
};

const handleDateChange = (dateRange: {
  startDate: string;
  endDate: string;
}) => {
  if (dateRange.startDate) {
    const formattedStartDate = dayjs(dateRange.startDate).format("MM-DD-YYYY");
    startDate.value = formattedStartDate;
    formData.start_time = formattedStartDate;
  }

  if (dateRange.endDate) {
    const formattedEndDate = dayjs(dateRange.endDate).format("MM-DD-YYYY");
    endDate.value = formattedEndDate;
    formData.end_time = formattedEndDate;
  }
};

// Handle file selection with comprehensive validation
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

const handleSubmit = async () => {
  try {
    if (!bannerId.value) {
      openNotification("error", "ຜິດພາດ", "ບໍ່ພົບລະຫັດປ້າຍໂຄສະນາ");
      return;
    }
    isLoading.value = true;
    const formattedData = {
      id: bannerId.value,
      ...formData,
      start_time: formData.start_time
        ? formatDateForApi(formData.start_time)
        : "",
      end_time: formData.end_time ? formatDateForApi(formData.end_time) : "",
      is_private: formData.is_private ? 1 : 0,
      lo_id: Number(formData.lo_id),
      en_id: Number(formData.en_id),
      zh_cn_id: Number(formData.zh_cn_id),
    };
    await bannerStore.updateBanner(bannerId.value, formattedData);

    openNotification("success", "ສຳເລັດ", "ອັບເດດຂໍ້ມູນສຳເລັດ");
    push({ name: "banners" });
  } catch (error: any) {
    console.error("ຜິດພາດ:", error);

    if (error.response?.data?.nested) {
      const errorMessages = Object.values(error.response.data.nested)
        .flat()
        .join("\n");
      openNotification("error", "ອັບເດດລົ້ມເລວ", errorMessages);
    } else {
      openNotification("error", "ຜິດພາດ", "ເກີດຂ້ໍຜິດພາດ");
    }
  } finally {
    isLoading.value = false;
  }
};

const removeBanner = (id: number) => {
  Modal.confirm({
    title: "ຢືນຢັນການລົບ",
    content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້??",
    okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
    cancelText: "ບໍ່,ຍົກເລີກ",
    okType: "danger",
    onOk: async () => {
      try {
        isLoading.value = true;
        await bannerStore.deleteBanner(id);
        alert("ລົບຂໍ້ມູນສຳເລັດ");
      } catch (err) {
        console.error("Error:", err);
      } finally {
        isLoading.value = false;
      }
    },
  });
};
// And make sure onMounted correctly captures IDs from translation data:
onMounted(async () => {
  try {
    if (bannerId.value) {
      isLoading.value = true;
      const bannerData = await bannerStore.getBannerId(bannerId.value);
      console.log("Received banner data:", bannerData); // Debug output

      if (bannerData) {
        // Map basic fields
        formData.link = bannerData.link || "";
        formData.is_private = bannerData.is_private === false;
        formData.existingImage = bannerData.image || "";

        if (bannerData.start_time) {
          const formattedStartDate = dayjs(bannerData.start_time).format(
            "MM-DD-YYYY"
          );
          startDate.value = formattedStartDate;
          formData.start_time = formattedStartDate;
        }

        if (bannerData.end_time) {
          const formattedEndDate = dayjs(bannerData.end_time).format(
            "MM-DD-YYYY"
          );
          endDate.value = formattedEndDate;
          formData.end_time = formattedEndDate;
        }
        // Map translations
        if (bannerData.translates && bannerData.translates.length > 0) {
          console.log("Translation data:", bannerData.translates); // Debug output

          // Find translations for each language
          const loTranslation = bannerData.translates.find(
            (t: any) => t.lang === "lo"
          );
          const enTranslation = bannerData.translates.find(
            (t: any) => t.lang === "en"
          );
          const zhTranslation = bannerData.translates.find(
            (t: any) => t.lang === "zh_cn"
          );

          // Set form data from translations
          if (loTranslation) {
            formData.lo_title = loTranslation.title || "";
            formData.lo_description = loTranslation.description || "";
            formData.lo_id = loTranslation.id; // ไม่ต้องแปลงเป็น string
          }

          if (enTranslation) {
            formData.en_title = enTranslation.title || "";
            formData.en_description = enTranslation.description || "";
            formData.en_id = enTranslation.id; // ไม่ต้องแปลงเป็น string
          }

          if (zhTranslation) {
            formData.zh_cn_title = zhTranslation.title || "";
            formData.zh_cn_description = zhTranslation.description || "";
            formData.zh_cn_id = zhTranslation.id;
          }
        }
      }
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="container mx-auto p-4 mt-12">
    <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
      ແກ້ໄຂຂໍ້ມູນປ້າຍໂຄສະນາ
    </h2>

    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <!-- แสดง loading -->
      <div
        class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-700"
      ></div>
    </div>

    <UiForm v-else :model="formData">
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
          <UiFormItem label="ຫົວຂໍ້" name="en_title">
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
              name="en_description"
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
          :existing-image-url="fullImageUrl"
          @onFileSelect="handleFileSelect"
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
              display-format="DD/MM/YYYY"
              date-format="MM-DD-YYYY"
              @change="handleDateChange"
            />
          </div>
        </div>
      </div>
      <div class="p-4 flex items-center gap-4">
        <UiButton
          @click="handleSubmit"
          icon="material-symbols:edit-square"
          type="submit"
          size="large"
          :loading="isLoading"
          colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
        >
          ອັບເດດ
        </UiButton>
        <UiButton
          @click="removeBanner"
          type="submit"
          icon="material-symbols:delete-outline"
          size="large"
          :loading="isLoading"
          colorClass="!bg-red-700 hover:!bg-red-900 text-white flex items-center"
        >
          ລຶບ
        </UiButton>
      </div>
    </UiForm>
  </div>
</template>
