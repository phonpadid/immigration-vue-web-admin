<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, computed, type Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { storeToRefs } from "pinia";
import { useCheckpointForm } from "../interface/useCheckpoint";
import { useCheckpointStore } from "../store/checkpoint.store";
import { useCheckpointProvinceStore } from "@/modules/checkpoints/province/store/province.store";
import { useCheckpointcategoriesStore } from "@/modules/checkpoints/category/store/checkpoint.categories.store";
import { TABS_CONFIG, COUNTRIES } from "../interface/checkpoint.constan";
import { getImageUrl } from "@/utils/ConfigPathImage";
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
import QuillEditorComponent from "@/components/editor/QuillEditorComponent.vue";

// Define proper types to avoid TypeScript errors
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

// Define translate item interface
interface TranslateItem {
  id: number;
  lang: TabLanguage;
  name: string;
  time_operation: string;
  address: string;
  content: string | EditorContent;
  slug?: string;
}

// Define checkpoint data interface
interface CheckpointData {
  id: number;
  category_id: number;
  province_id: number;
  country: string;
  image: string;
  link_map: string;
  phone_number: string;
  email: string;
  visa: boolean;
  e_visa: boolean;
  translates: TranslateItem[];
  [key: string]: any;
}

// Define form data structure
interface CheckpointFormData {
  category_id: number;
  province_id: number;
  country: string;
  image: string;
  link_map: string;
  phone_number: string;
  email: string;
  visa: boolean;
  e_visa: boolean;
  translates: {
    [key in TabLanguage]: {
      id: number;
      name: string;
      time_operation: string;
      address: string;
      content: string | EditorContent;
    };
  };
}

// Router and Store setup
const route = useRoute();
const router = useRouter();
const checkpointStore = useCheckpointStore();
const provinceStore = useCheckpointProvinceStore();
const categoryStore = useCheckpointcategoriesStore();

// Get checkpoint ID from route
const checkpointId = computed(() => Number(route.params.id));

// Form setup using composable
const {
  form,
  formRef,
  uploadedFile,
  imageError,
  isLoading,
  activeTab,
  hasChanges,
  validate,
} = useCheckpointForm();

// Ensure form has correct structure with TypeScript
const typedForm = form as unknown as CheckpointFormData;

// Store refs
const { checkpointCategories } = storeToRefs(categoryStore) as unknown as {
  checkpointCategories: Ref<{
    data: Array<{
      id: number;
      translates: Array<{ lang: string; title: string }>;
    }>;
  }>;
};

const { checkpointProvince } = storeToRefs(provinceStore) as unknown as {
  checkpointProvince: Ref<{
    data: Array<{
      id: number;
      translates: Array<{ lang: string; name: string }>;
    }>;
  }>;
};

// Computed properties for options
const categoryOptions = computed(() => [
  { value: 0, label: "ກະລຸນາເລືອກປະເພດດ່ານ" },
  ...(checkpointCategories.value?.data.map((category) => ({
    value: category.id,
    label:
      category.translates.find((t) => t.lang === "lo")?.title ||
      `ປະເພດດ່ານ ${category.id}`,
  })) || []),
]);

const provinceOptions = computed(() => [
  { value: 0, label: "ກະລຸນາເລືອກແຂວງ" },
  ...(checkpointProvince.value?.data.map((province) => ({
    value: province.id,
    label:
      province.translates.find((t) => t.lang === "lo")?.name ||
      `ແຂວງ ${province.id}`,
  })) || []),
]);

// Methods
const handleFileSelect = (file: File) => {
  uploadedFile.value = file;
  imageError.value = "";
};

// Function to parse content from API
const parseContentFromApi = (contentData: any): string => {
  try {
    // If contentData is a string, try to parse it as JSON
    if (typeof contentData === "string") {
      try {
        contentData = JSON.parse(contentData);
      } catch (e) {
        console.error("Content is not a valid JSON string:", e);
        return contentData;
      }
    }

    // If it's already in the correct format (has type: 'doc')
    if (
      contentData &&
      contentData.type === "doc" &&
      Array.isArray(contentData.content)
    ) {
      return JSON.stringify(contentData);
    }

    console.warn("Content format not recognized:", contentData);
    return JSON.stringify(contentData);
  } catch (e) {
    console.error("Error parsing content from API:", e);
    return "";
  }
};

// Format content for submission
const formatContentForSubmit = (content: any): string => {
  try {
    if (!content) return "";

    // If already a string and JSON format
    if (typeof content === "string") {
      try {
        const parsed = JSON.parse(content);
        if (parsed.type === "doc") {
          return content; // Return as is if already in correct format
        }
      } catch (e) {
        // Not JSON, continue
      }
    }

    // If object, stringify it
    return typeof content === "string" ? content : JSON.stringify(content);
  } catch (e) {
    console.error("Error formatting content:", e);
    return "";
  }
};

// Handle submit with proper typing
const handleSubmit = async () => {
  try {
    isLoading.value = true;

    const formData = new FormData();

    // Append basic fields
    formData.append("category_id", typedForm.category_id.toString());
    formData.append("province_id", typedForm.province_id.toString());
    formData.append("country", typedForm.country);
    formData.append("link_map", typedForm.link_map || "");
    formData.append("phone_number", typedForm.phone_number || "");
    formData.append("email", typedForm.email || "");
    formData.append("visa", String(typedForm.visa));
    formData.append("e_visa", String(typedForm.e_visa));

    // Append image if new file is selected
    if (uploadedFile.value) {
      formData.append("image", uploadedFile.value);
    }

    // Append translations with their IDs
    Object.entries(typedForm.translates).forEach(([lang, data]) => {
      const translationData = {
        id: data.id,
        name: data.name.trim(),
        time_operation: data.time_operation.trim(),
        address: data.address.trim(),
        content: formatContentForSubmit(data.content),
      };

      formData.append(lang, JSON.stringify(translationData));
    });

    console.log(
      "Form data being submitted:",
      Object.fromEntries(formData.entries())
    );

    await checkpointStore.updateCheckpoint(checkpointId.value, formData);

    router.push("/admin/checkpoint");
    message.success("ແກ້ໄຂຂໍ້ມູນດ່ານສຳເລັດ");
  } catch (error: any) {
    message.error(error?.message || "ເກີດຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນ");
  } finally {
    isLoading.value = false;
  }
};

// Load checkpoint data with proper typing
const loadCheckpointData = async () => {
  try {
    isLoading.value = true;

    const [checkpointData] = await Promise.all([
      checkpointStore.getCheckpointById(checkpointId.value),
      categoryStore.getAllCheckpointCategories(),
      provinceStore.getAllCheckpointProvine(),
    ]);

    if (!checkpointData) {
      throw new Error("ບໍ່ພົບຂໍ້ມູນດ່ານ");
    }

    console.log("Raw checkpoint data:", checkpointData);

    // Cast to our interface
    const checkpoint = checkpointData as unknown as CheckpointData;

    // Initialize form structure if needed
    if (!typedForm.translates) {
      typedForm.translates = {
        lo: { id: 0, name: "", time_operation: "", address: "", content: "" },
        en: { id: 0, name: "", time_operation: "", address: "", content: "" },
        zh_cn: {
          id: 0,
          name: "",
          time_operation: "",
          address: "",
          content: "",
        },
      };
    }

    // Set basic fields
    typedForm.category_id = checkpoint.category_id;
    typedForm.province_id = checkpoint.province_id;
    typedForm.country = checkpoint.country;
    typedForm.link_map = checkpoint.link_map || "";
    typedForm.phone_number = checkpoint.phone_number || "";
    typedForm.email = checkpoint.email || "";
    typedForm.visa = checkpoint.visa || false;
    typedForm.e_visa = checkpoint.e_visa || false;
    typedForm.image = checkpoint.image || "";

    // Process translations from array to object structure
    if (Array.isArray(checkpoint.translates)) {
      checkpoint.translates.forEach((translate: TranslateItem) => {
        const lang = translate.lang;
        if (lang && ["lo", "en", "zh_cn"].includes(lang)) {
          typedForm.translates[lang] = {
            id: translate.id,
            name: translate.name || "",
            time_operation: translate.time_operation || "",
            address: translate.address || "",
            content: parseContentFromApi(translate.content || ""),
          };
        }
      });
    }

    console.log("Form data after processing:", {
      basic: {
        category_id: typedForm.category_id,
        province_id: typedForm.province_id,
      },
      translations: {
        lo: typedForm.translates.lo?.name,
        en: typedForm.translates.en?.name,
        zh_cn: typedForm.translates.zh_cn?.name,
      },
    });
  } catch (error: any) {
    console.error("Error loading checkpoint:", error);
    message.error(error.message || "ບໍ່ສາມາດໂຫລດຂໍ້ມູນດ່ານໄດ້");
    router.push("/checkpoint");
  } finally {
    isLoading.value = false;
  }
};

// Handle unsaved changes
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasChanges.value) {
    e.preventDefault();
    e.returnValue = "";
  }
};

// Route change handler
const handleRouteChange = async (newPath: string, oldPath: string) => {
  if (hasChanges.value && newPath !== oldPath) {
    const confirmed = await window.confirm(
      "ທ່ານມີການປ່ຽນແປງທີ່ຍັງບໍ່ໄດ້ບັນທຶກ. ທ່ານຕ້ອງການອອກຈາກໜ້ານີ້ແທ້ບໍ?"
    );
    if (!confirmed) {
      router.push(oldPath);
    }
  }
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener("beforeunload", handleBeforeUnload);
  loadCheckpointData();
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});

// Watch for route changes
watch(() => route.path, handleRouteChange);
</script>

<template>
  <div class="container mx-auto px-4">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">
        ແກ້ໄຂຂໍ້ມູນດ່ານ
      </h2>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex justify-center items-center min-h-[400px]"
    >
      <a-spin size="large" />
    </div>

    <!-- Form -->
    <UiForm v-else ref="formRef" :model="form" class="space-y-6">
      <!-- Tabs for Translations -->
      <Tab v-model:activeKey="activeTab" :tabs="TABS_CONFIG">
        <template v-for="tab in TABS_CONFIG" :key="tab.key" #[tab.slotName]>
          <!-- :name="`translates.${tab.lang}.name`" -->
          <UiFormItem label="ຊື່ດ່ານ" required>
            <UiInput
              v-model="typedForm.translates[tab.lang as TabLanguage].name"
              placeholder="ປ້ອນຊື່ດ່ານ"
              size="large"
            />
          </UiFormItem>

          <UiFormItem
            :name="`translates.${tab.lang}.time_operation`"
            label="ເວລາເປີດ-ປິດ"
          >
            <UiInput
              v-model="typedForm.translates[tab.lang as TabLanguage].time_operation"
              placeholder="ປ້ອນເວລາເປີດ-ປິດ"
              size="large"
            />
          </UiFormItem>

          <UiFormItem :name="`translates.${tab.lang}.address`" label="ທີ່ຢູ່">
            <Textarea
              v-model="typedForm.translates[tab.lang as TabLanguage].address"
              placeholder="ບ້ານ:...,ເມືອງ....,ແຂວງ:..."
              :rows="3"
              size="large"
            />
          </UiFormItem>

          <UiFormItem :name="`translates.${tab.lang}.content`" label="ເນື້ອຫາ">
            <QuillEditorComponent
              v-model="typedForm.translates[tab.lang as TabLanguage].content as string"
              placeholder="ປ້ອນເນື້ອຫາ..."
            />
          </UiFormItem>
        </template>
      </Tab>

      <!-- Basic Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UiFormItem label="ເລືອກປະເພດດ່ານ" name="category_id" required>
          <InputSelect
            v-model:value="typedForm.category_id"
            :options="categoryOptions"
            placeholder="ເລືອກປະເພດດ່ານ"
            size="large"
          />
        </UiFormItem>

        <UiFormItem label="ເລືອກແຂວງ" name="province_id" required>
          <InputSelect
            v-model:value="typedForm.province_id"
            :options="provinceOptions"
            placeholder="ເລືອກແຂວງ"
            size="large"
          />
        </UiFormItem>

        <UiFormItem label="ປະເທດ" name="country" required>
          <InputSelect
            v-model:value="typedForm.country"
            :options="COUNTRIES"
            placeholder="ເລືອກປະເທດ"
            size="large"
          />
        </UiFormItem>

        <div class="flex items-center space-x-4">
          <UiCheckbox v-model:checked="typedForm.visa" class="flex-1">
            ຮັບ Visa
          </UiCheckbox>
          <UiCheckbox v-model:checked="typedForm.e_visa" class="flex-1">
            ຮັບ E-Visa
          </UiCheckbox>
        </div>
      </div>

      <!-- Image Upload -->
      <div class="space-y-2">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          ຮູບພາບດ່ານ <span class="text-red-500">*</span>
        </label>
        <UploadDragger
          :existingImageUrl="
            typedForm.image ? getImageUrl(typedForm.image) : ''
          "
          @onFileSelect="handleFileSelect"
        />
        <div v-if="imageError" class="text-sm text-red-500">
          {{ imageError }}
        </div>
      </div>

      <!-- Contact Information -->
      <div class="space-y-4">
        <UiFormItem label="ເບີໂທຕິດຕໍ່" name="phone_number">
          <UiInput
            v-model="typedForm.phone_number"
            placeholder="ປ້ອນເບີໂທຕິດຕໍ່"
            size="large"
          />
        </UiFormItem>

        <UiFormItem label="ອີເມວຕິດຕໍ່" name="email">
          <UiInput
            v-model="typedForm.email"
            placeholder="ປ້ອນອີເມວຕິດຕໍ່"
            size="large"
          />
        </UiFormItem>

        <UiFormItem label="ລິ້ງແຜນທີ່" name="link_map">
          <Textarea
            v-model="typedForm.link_map"
            placeholder="ປ້ອນລິ້ງແຜນທີ່"
            :rows="3"
            size="large"
          />
        </UiFormItem>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-between items-center">
        <div class="flex gap-4">
          <UiButton
            type="primary"
            size="large"
            colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
            :loading="isLoading"
            @click="handleSubmit"
          >
            {{ isLoading ? "ກຳລັງແກ້ໄຂ..." : "ແກ້ໄຂຂໍ້ມູນ" }}
          </UiButton>
        </div>
      </div>
    </UiForm>
    <br />
  </div>
</template>

<style scoped>
/* Editor Styles */
:deep(.quill-editor) {
  height: 200px;
  margin-bottom: 1rem;
}

:deep(.ql-container) {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

:deep(.ql-toolbar) {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

/* Form Styles */
:deep(.ant-form-item) {
  margin-bottom: 1.5rem;
}

:deep(.ant-input),
:deep(.ant-select-selector) {
  border-radius: 4px;
}

/* Dark Mode Support */
:deep(.dark) {
  .ant-form-item-label > label {
    color: var(--text-light);
  }

  .ant-input,
  .ant-select-selector {
    background-color: var(--bg-dark);
    border-color: var(--border-dark);
    color: var(--text-light);
  }
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
