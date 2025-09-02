<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCountryStore } from "../store/country.store";
import { useNotification } from "@/utils/notificationService";
import * as Yup from "yup";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiInput from "@/components/Input/UiInput.vue";
import Tab from "@/components/Tab/Tab.vue";
import UiButton from "@/components/button/UiButton.vue";
import Textarea from "@/components/Input/Textarea.vue";
import UploadDragger from "@/components/Upload/UploadDragger.vue";
import Switch from "@/components/Switch/Switch.vue";
import { Modal } from "ant-design-vue";

// Type definitions
type LanguageKey = "lo" | "en" | "zh_cn";

// Constants
const IMAGE_MAX_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

// Store and router hooks
const countryStore = useCountryStore();
const route = useRoute();
const router = useRouter();
const { openNotification } = useNotification();

// Base URLs from environment
const imageBaseUrl = import.meta.env.VITE_IMG_URL;

// Reactive state
const isLoading = ref(false);
const activeTab = ref("1");
const formRef = ref();
const selectedImage = ref<File | null>(null);
const currentCountryId = ref<number | null>(null);

// Tabs configuration
const tabsConfig = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3" },
];

// Form validation schema with more detailed validation
const validationSchema = Yup.object().shape({
  lo: Yup.object().shape({
    name: Yup.string()
      .trim()
      .required("ກະລຸນາປ້ອນຊື່ປະເທດ")
      .min(2, "ຊື່ປະເທດຕ້ອງມີຄວາມຍາວຢ່າງນ້ອຍ 2 ຕົວອັກສອນ"),
    description: Yup.string().optional(),
  }),
  en: Yup.object().shape({
    name: Yup.string()
      .trim()
      .required("Please enter country name")
      .min(2, "Country name must be at least 2 characters long"),
    description: Yup.string().optional(),
  }),
  zh_cn: Yup.object().shape({
    name: Yup.string()
      .trim()
      .required("请输入国家名称")
      .min(2, "国家名称必须至少2个字符"),
    description: Yup.string().optional(),
  }),
});

// Reactive form data
const formData = reactive({
  lo: { id: null as number | null, name: "", description: "" },
  en: { id: null as number | null, name: "", description: "" },
  zh_cn: { id: null as number | null, name: "", description: "" },
  is_except_visa: false,
  image: null as File | null,
  existingImage: "", // URL of existing image
});

// Computed full image URL
const fullImageUrl = computed(() => {
  return formData.existingImage
    ? `${imageBaseUrl}/${formData.existingImage}`
    : "";
});

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

// Fetch country details for update
const fetchCountryDetails = async () => {
  try {
    // Validate and parse country ID
    const countryId = Number(route.params.id);

    // Check for invalid ID
    if (isNaN(countryId)) {
      openNotification(
        "error",
        "Invalid Country ID",
        "Please select a valid country"
      );
      router.push({ name: "countries" });
      return;
    }

    currentCountryId.value = countryId;

    // Fetch country details
    const country = await countryStore.getCountryById(countryId);

    // Check if country exists
    if (!country) {
      openNotification(
        "error",
        "Country Not Found",
        "The requested country does not exist"
      );
      router.push({ name: "countries" });
      return;
    }

    // Populate form data
    const populateLanguageData = (lang: LanguageKey) => {
      const translate = country.translates.find((t: any) => t.lang === lang);
      return {
        id: translate?.id || null,
        name: translate?.name || "",
        description: translate?.description || "",
      };
    };

    formData.lo = populateLanguageData("lo");
    formData.en = populateLanguageData("en");
    formData.zh_cn = populateLanguageData("zh_cn");

    formData.is_except_visa = country.is_except_visa || false;
    formData.existingImage = country.image || "";
  } catch (error) {
    console.error("Failed to fetch country details:", error);
    openNotification("error", "Error", "Unable to load country details");
    router.push({ name: "countries" });
  }
};

// Form submission handler with enhanced error handling
const handleSubmit = async () => {
  try {
    // Validate form data
    await validationSchema.validate(formData, { abortEarly: false });

    // Ensure we have a country ID
    if (!currentCountryId.value) {
      throw new Error("No country ID provided");
    }

    // Start loading
    isLoading.value = true;

    // Prepare update payload
    const updatePayload = {
      lo: {
        id: formData.lo.id,
        name: formData.lo.name.trim(),
        description: formData.lo.description.trim(),
      },
      en: {
        id: formData.en.id,
        name: formData.en.name.trim(),
        description: formData.en.description.trim(),
      },
      zh_cn: {
        id: formData.zh_cn.id,
        name: formData.zh_cn.name.trim(),
        description: formData.zh_cn.description.trim(),
      },
      is_except_visa: formData.is_except_visa,
      image: selectedImage.value,
    };

    // Update country
    await countryStore.updateCountry(currentCountryId.value, updatePayload);

    // Show success notification
    openNotification("success", "ອັບເດດຂໍ້ມູນປະເທດ", "ອັບເດດສຳເລັດ");

    // Navigate back to countries list
    router.push({ name: "countries" });
  } catch (error) {
    // Handle validation errors
    if (error instanceof Yup.ValidationError) {
      const errorDetails = error.inner
        .map((err) => `${err.path}: ${err.message}`)
        .join(", ");

      openNotification("error", "Validation Error", errorDetails);
    } else {
      console.error("Update error:", error);
      openNotification(
        "error",
        "Update Failed",
        "An unexpected error occurred. Please try again."
      );
    }
  } finally {
    // End loading
    isLoading.value = false;
  }
};
/***********************Delete**************************** */
const removeCountry = (id: number) => {
  Modal.confirm({
    title: "ຢືນຢັນການລົບ",
    content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້??",
    okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
    cancelText: "ບໍ່,ຍົກເລີກ",
    okType: "danger",
    onOk: async () => {
      try {
        isLoading.value = true;
        await countryStore.deleteCountry(id);
        router.push({ name: "countries" });
        openNotification("success", "ລຶບຂໍ້ມູນ", "ລົບຂໍ້ມູນສຳເລັດ");
      } catch (err) {
        console.error("Error:", err);
        openNotification("error", "ລຶບຂໍ້ມູນ", "ເກີດຂໍ້ຜິດພາດໃນການລຶບ");
      } finally {
        isLoading.value = false;
      }
    },
  });
};

// Fetch country details when component mounts
onMounted(fetchCountryDetails);
</script>

<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white ">
    ອັບເດດປະເທດ
  </h2>

  <UiForm ref="formRef" :model="formData">
    <Tab v-model="activeTab" :tabs="tabsConfig">
      <!-- Lao Language Tab -->
      <template #tab1>
        <UiFormItem label="ຊື່" name="lo.name">
          <UiInput
            v-model="formData.lo.name"
            placeholder="ປ້ອນຊື່"
            allowClear
            size="large"
          />
        </UiFormItem>
        <UiFormItem label="ຄຳອະທິບາຍ" name="lo.description">
          <Textarea
            v-model="formData.lo.description"
            placeholder="ປ້ອນຄຳອະທິບາຍ"
            name="lo.description"
          />
        </UiFormItem>
      </template>

      <!-- English Language Tab -->
      <template #tab2>
        <UiFormItem label="ຊື່" name="en.name">
          <UiInput
            v-model="formData.en.name"
            placeholder="ປ້ອນຊື່"
            allowClear
            size="large"
          />
        </UiFormItem>
        <UiFormItem label="ຄຳອະທິບາຍ" name="en.description">
          <Textarea
            v-model="formData.en.description"
            placeholder="ປ້ອນຄຳອະທິບາຍ"
            name="en.description"
          />
        </UiFormItem>
      </template>

      <!-- Chinese Language Tab -->
      <template #tab3>
        <UiFormItem label="ຊື່" name="zh_cn.name">
          <UiInput
            v-model="formData.zh_cn.name"
            placeholder="ປ້ອນຊື່"
            allowClear
            size="large"
          />
        </UiFormItem>
        <UiFormItem label="ຄຳອະທິບາຍ" name="zh_cn.description">
          <Textarea
            v-model="formData.zh_cn.description"
            placeholder="ປ້ອນຄຳອະທິບາຍ"
            name="zh_cn.description"
          />
        </UiFormItem>
      </template>
    </Tab>
    <UploadDragger
      :existing-image-url="fullImageUrl"
      @onFileSelect="handleFileSelect"
    />
    <div class="grid gap-4 my-4 md:grid-cols-2 md:gap-6">
      <Switch
        v-model="formData.is_except_visa"
        label="ຍົກເວັ້ນວິຊາ"
        name="is_except_visa"
      />
    </div>
    <div class="p-4 flex items-center gap-4">
      <UiButton
        @click="handleSubmit"
        type="submit"
        size="large"
        :loading="isLoading"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
      >
        ອັບເດດປະເທດ
      </UiButton>
      <UiButton
        @click="currentCountryId !== null && removeCountry(currentCountryId)"
        type="button"
        size="large"
        icon="material-symbols:delete-outline-sharp"
        colorClass="!bg-red-500 hover:!bg-red-700 text-white flex items-center"
      >
        ລຶບ
      </UiButton>
    </div>
  </UiForm>
</template>
