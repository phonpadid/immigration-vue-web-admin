<script setup lang="ts">
import { reactive, ref, onMounted, computed, type Ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { storeToRefs } from "pinia";
import QuillEditorComponent from "@/components/editor/QuillEditorComponent.vue";
import type {
  QuillDelta,
  QuillContent,
} from "@/components/editor/editor.types";
import type {
  CheckpointForm,
  ValidationRules,
  SupportedLanguage,
} from "@/types/checkpoint.type";
import {
  TABS_CONFIG,
  COUNTRIES,
  DEFAULT_FORM_VALUES,
} from "../interface/checkpoint.constan";
import { formatContentForSubmit } from "@/utils/formatContent";
import { useCheckpointStore } from "../store/checkpoint.store";
import { useCheckpointProvinceStore } from "@/modules/checkpoints/province/store/province.store";
import { useCheckpointcategoriesStore } from "@/modules/checkpoints/category/store/checkpoint.categories.store";

// Components
import Tab from "@/components/Tab/Tab.vue";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiInput from "@/components/Input/UiInput.vue";
import Textarea from "@/components/Input/Textarea.vue";
import InputSelect from "@/components/Input/InputSelect.vue";
import UiButton from "@/components/button/UiButton.vue";
import UploadDragger from "@/components/Upload/UploadDragger.vue";
import UiCheckbox from "@/components/Checkbox/UiCheckbox.vue";

// Define type for tab languages
type TabLanguage = "lo" | "en" | "zh_cn";

// Define content type for editor
interface EditorContent {
  type: string;
  content: Array<{
    type: string;
    attrs?: {
      textAlign?: string;
      [key: string]: any;
    };
    content?: Array<{
      type: string;
      text?: string;
      [key: string]: any;
    }>;
    [key: string]: any;
  }>;
  [key: string]: any;
}

// Category and Province interfaces
interface CategoryItem {
  id: number;
  translates: Array<{
    lang: string;
    title: string;
  }>;
  lo?: {
    title: string;
    description: string;
  };
  en?: {
    title: string;
    description: string;
  };
  zh_cn?: {
    title: string;
    description: string;
  };
}

interface CategoryResponse {
  data: CategoryItem[];
  total: number;
}

interface ProvinceItem {
  id: number;
  translates: Array<{
    lang: string;
    name: string;
  }>;
  lo?: {
    name: string;
  };
  en?: {
    name: string;
  };
  zh_cn?: {
    name: string;
  };
}

interface ProvinceResponse {
  data: ProvinceItem[];
  total: number;
}

// Router and Store setup
const router = useRouter();
const checkpointStore = useCheckpointStore();
const provinceStore = useCheckpointProvinceStore();
const categoryStore = useCheckpointcategoriesStore();

// Type-safe store references
const { checkpointCategories } = storeToRefs(categoryStore) as unknown as {
  checkpointCategories: Ref<CategoryResponse>;
};
const { checkpointProvince } = storeToRefs(provinceStore) as unknown as {
  checkpointProvince: Ref<ProvinceResponse>;
};

// Local states
const activeTab = ref<string>("1");
const isLoading = ref<boolean>(false);
const formRef = ref<InstanceType<typeof UiForm>>();
const uploadedFile = ref<File | null>(null);
const imageError = ref<string>("");

// Form state with proper type casting to ensure content field is handled correctly
const checkpointForm = reactive<CheckpointForm>({
  ...DEFAULT_FORM_VALUES,
});

// Ensure the content field is treated properly for editor
const getFormattedContent = (content: any): string => {
  if (!content) return "";

  if (typeof content === "string") {
    return content;
  }

  try {
    return JSON.stringify(content);
  } catch (e) {
    console.error("Error formatting content for editor:", e);
    return "";
  }
};

// Computed properties for options
const categoryOptions = computed(() => {
  const options = [{ value: 0, label: "ກະລຸນາເລືອກປະເພດດ່ານ" }];

  if (checkpointCategories.value?.data) {
    checkpointCategories.value.data.forEach((category) => {
      const loTranslate = category.translates.find((t) => t.lang === "lo");
      options.push({
        value: category.id,
        label: loTranslate?.title || `ປະເພດດ່ານ ${category.id}`,
      });
    });
  }

  return options;
});

const provinceOptions = computed(() => {
  const options = [{ value: 0, label: "ກະລຸນາເລືອກແຂວງ" }];

  if (checkpointProvince.value?.data) {
    checkpointProvince.value.data.forEach((province) => {
      const loTranslate = province.translates.find((t) => t.lang === "lo");
      options.push({
        value: province.id,
        label: loTranslate?.name || `ແຂວງ ${province.id}`,
      });
    });
  }

  return options;
});

// Methods
const handleFileSelect = (file: File) => {
  uploadedFile.value = file;
  imageError.value = "";
  checkpointForm.image = file;
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;

    // Validate required fields
    if (checkpointForm.category_id === 0) {
      message.error("ກະລຸນາເລືອກປະເພດດ່ານ");
      isLoading.value = false;
      return;
    }

    if (checkpointForm.province_id === 0) {
      message.error("ກະລຸນາເລືອກແຂວງ");
      isLoading.value = false;
      return;
    }

    if (!checkpointForm.country) {
      message.error("ກະລຸນາເລືອກປະເທດ");
      isLoading.value = false;
      return;
    }

    if (!uploadedFile.value) {
      imageError.value = "ກະລຸນາອັບໂຫລດຮູບພາບ";
      isLoading.value = false;
      return;
    }

    const formData = new FormData();

    // Add basic fields
    formData.append("category_id", checkpointForm.category_id.toString());
    formData.append("province_id", checkpointForm.province_id.toString());
    formData.append("country", checkpointForm.country);
    formData.append("link_map", checkpointForm.link_map);
    formData.append("phone_number", checkpointForm.phone_number);
    formData.append("email", checkpointForm.email);
    formData.append("visa", String(checkpointForm.visa));
    formData.append("e_visa", String(checkpointForm.e_visa));

    // Add image if exists
    if (uploadedFile.value) {
      formData.append("image", uploadedFile.value);
    }

    // Process translations with proper content formatting
    Object.entries(checkpointForm.translates).forEach(([lang, data]) => {
      // Format content for submission
      let contentValue = data.content;
      if (typeof contentValue !== "string") {
        contentValue = JSON.stringify(contentValue);
      }

      formData.append(
        lang,
        JSON.stringify({
          name: data.name,
          time_operation: data.time_operation,
          address: data.address,
          content: contentValue,
        })
      );
    });

    // Log FormData for debugging
    console.log("Form data being submitted:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    const result = await checkpointStore.createCheckpoint(formData);
    if (result) {
      message.success("ບັນທຶກຂໍ້ມູນດ່ານສຳເລັດ");
      router.push("/admin/checkpoint");
    }
  } catch (error: any) {
    console.error("Error creating checkpoint:", error);
    message.error(error?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ");
  } finally {
    isLoading.value = false;
  }
};

// Load initial data
onMounted(async () => {
  try {
    await Promise.all([
      categoryStore.getAllCheckpointCategories(),
      provinceStore.getAllProvinces(),
    ]);
  } catch (error) {
    console.error("Failed to load initial data:", error);
    message.error("ບໍ່ສາມາດໂຫລດຂໍ້ມູນເລີ່ມຕົ້ນໄດ້");
  }
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
      ເພີ່ມຂໍ້ມູນດ່ານ
    </h2>

    <UiForm ref="formRef" :model="checkpointForm">
      <!-- Tab Content -->
      <Tab v-model:activeKey="activeTab" :tabs="TABS_CONFIG">
        <template v-for="tab in TABS_CONFIG" :key="tab.key" #[tab.slotName]>
          <UiFormItem :name="`translates.${tab.lang}.name`" label="ຊື່ດ່ານ">
            <UiInput
              v-model="checkpointForm.translates[tab.lang as TabLanguage].name"
              placeholder="ປ້ອນຊື່ດ່ານ"
              size="large"
            />
          </UiFormItem>

          <UiFormItem
            :name="`translates.${tab.lang}.time_operation`"
            label="ເວລາເປີດ-ປິດ"
          >
            <UiInput
              v-model="checkpointForm.translates[tab.lang as TabLanguage].time_operation"
              placeholder="ປ້ອນເວລາເປີດ-ປິດ"
              size="large"
            />
          </UiFormItem>

          <UiFormItem :name="`translates.${tab.lang}.address`" label="ທີ່ຢູ່">
            <Textarea
              v-model="checkpointForm.translates[tab.lang as TabLanguage].address"
              placeholder="ບ້ານ:...,ເມືອງ....,ແຂວງ:..."
              :rows="3"
              size="large"
            />
          </UiFormItem>

          <UiFormItem :name="`translates.${tab.lang}.content`" label="ເນື້ອຫາ">
            <QuillEditorComponent
              v-model="checkpointForm.translates[tab.lang as TabLanguage].content as unknown as string"
              placeholder="ປ້ອນເນື້ອຫາ..."
            />
          </UiFormItem>
        </template>
      </Tab>

      <!-- Basic Information Section -->
      <div class="my-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <UiFormItem label="ເລືອກປະເພດດ່ານ" name="category_id" required>
          <InputSelect
            v-model:value="checkpointForm.category_id"
            :options="categoryOptions"
            placeholder="ເລືອກປະເພດດ່ານ"
            size="large"
          />
        </UiFormItem>

        <UiFormItem label="ເລືອກແຂວງທີຢູ່ຂອງດ່ານ" name="province_id" required>
          <InputSelect
            v-model:value="checkpointForm.province_id"
            :options="provinceOptions"
            placeholder="ເລືອກແຂວງ"
            size="large"
          />
        </UiFormItem>

        <div>
          <UiFormItem label="ເລືອກຊາຍແດນປະເທດ" name="country" required>
            <InputSelect
              v-model:value="checkpointForm.country"
              :options="COUNTRIES"
              placeholder="ເລືອກປະເທດ"
              size="large"
            />
          </UiFormItem>
        </div>
        <div class="flex items-center h-full mb-4">
          <UiCheckbox v-model:checked="checkpointForm.visa" label="ຮັບ Visa" />
          <UiCheckbox
            v-model:checked="checkpointForm.e_visa"
            label="ຮັບ E-Visa"
          />
        </div>
      </div>

      <!-- Image Upload -->
      <div class="mb-6">
        <label
          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          ຮູບພາບດ່ານ <span class="text-red-500">*</span>
        </label>
        <UploadDragger
          :existingImageUrl="
            typeof checkpointForm.image === 'string' ? checkpointForm.image : ''
          "
          @onFileSelect="handleFileSelect"
        />
        <div v-if="imageError" class="mt-1 text-sm text-red-500">
          {{ imageError }}
        </div>
      </div>

      <!-- Contact Information -->
      <UiFormItem label="ເບີໂທຕິດຕໍ່" name="phone_number">
        <UiInput
          v-model="checkpointForm.phone_number"
          placeholder="ປ້ອນເບີໂທຕິດຕໍ່"
          size="large"
        />
      </UiFormItem>

      <UiFormItem label="ອີເມວຕິດຕໍ່" name="email">
        <UiInput
          v-model="checkpointForm.email"
          placeholder="ປ້ອນອີເມວຕິດຕໍ່"
          size="large"
        />
      </UiFormItem>

      <!-- Map Link -->
      <UiFormItem label="ລິ້ງແຜນທີ່" name="link_map">
        <Textarea
          v-model="checkpointForm.link_map"
          placeholder="ປ້ອນລິ້ງແຜນທີ່"
          :rows="3"
          size="large"
        />
      </UiFormItem>

      <!-- Submit Button -->
      <div class="flex justify-start gap-4 mt-6">
        <UiButton
          type="primary"
          size="large"
          colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
          :loading="isLoading"
          @click="handleSubmit"
        >
          {{ isLoading ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກຂໍ້ມູນ" }}
        </UiButton>
      </div>
    </UiForm>
  </div>
</template>

<style scoped>
/* ...existing styles... */
</style>
