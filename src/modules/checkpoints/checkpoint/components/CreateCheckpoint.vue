<script setup lang="ts">
import { reactive, ref, onMounted, computed } from "vue";
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
import {
  validationRules,
  validateTranslations,
} from "../validation/checkpoint.validation";
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

// Router และ Store
const router = useRouter();
const checkpointStore = useCheckpointStore();
const provinceStore = useCheckpointProvinceStore();
const categoryStore = useCheckpointcategoriesStore();
const { checkpointCategories } = storeToRefs(categoryStore);
const { checkpointProvince } = storeToRefs(provinceStore);

// Local states
const activeTab = ref<string>("1");
const isLoading = ref<boolean>(false);
const formRef = ref<InstanceType<typeof UiForm>>();
const uploadedFile = ref<File | null>(null);
const imageError = ref<string>("");

// Form state
const checkpointForm = reactive<CheckpointForm>({
  ...DEFAULT_FORM_VALUES,
});

// Computed properties
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

const validateForm = async (): Promise<boolean> => {
  try {
    // Validate form fields
    await formRef.value?.submitForm();

    // Validate image
    if (!uploadedFile.value && !checkpointForm.image) {
      imageError.value = "ກະລຸນາອັບໂຫລດຮູບພາບ";
      message.error("ກະລຸນາອັບໂຫລດຮູບພາບ");
      return false;
    }

    // Validate translations
    const translationErrors = validateTranslations(checkpointForm.translates);
    if (translationErrors.length > 0) {
      message.error(translationErrors[0]);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Form validation failed:", error);
    return false;
  }
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;

    const isValid = await validateForm();
    if (!isValid) {
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
    formData.append("visa", checkpointForm.visa.toString());
    formData.append("e_visa", checkpointForm.e_visa.toString());

    // Add image if exists
    if (uploadedFile.value) {
      formData.append("image", uploadedFile.value);
    }

    // Process translations
    Object.entries(checkpointForm.translates).forEach(([lang, data]) => {
      formData.append(
        lang,
        JSON.stringify({
          name: data.name,
          time_operation: data.time_operation,
          address: data.address,
          content: formatContentForSubmit(data.content),
        })
      );
    });

    const result = await checkpointStore.createCheckpoint(formData);
    if (result) {
      message.success("ບັນທຶກຂໍ້ມູນດ່ານສຳເລັດ");
      router.push("/checkpoint");
    }
  } catch (error: any) {
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
      provinceStore.getAllCheckpointProvine(),
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

    <UiForm ref="formRef" :model="checkpointForm" :rules="validationRules">
      <!-- Image Upload Section -->
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

      <!-- Basic Information Section -->
      <div class="grid gap-6 mb-6 md:grid-cols-2">
        <UiFormItem label="ເລືອກປະເພດດ່ານ" name="category_id" required>
          <InputSelect
            v-model:value="checkpointForm.category_id"
            :options="categoryOptions"
            placeholder="ເລືອກປະເພດດ່ານ"
            size="large"
          />
        </UiFormItem>

        <UiFormItem label="ເລືອກແຂວງ" name="province_id" required>
          <InputSelect
            v-model:value="checkpointForm.province_id"
            :options="provinceOptions"
            placeholder="ເລືອກແຂວງ"
            size="large"
          />
        </UiFormItem>

        <UiFormItem label="ປະເທດ" name="country" required>
          <InputSelect
            v-model:value="checkpointForm.country"
            :options="COUNTRIES"
            placeholder="ເລືອກປະເທດ"
            size="large"
          />
        </UiFormItem>

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
      </div>

      <!-- Visa Options -->
      <div class="flex gap-6 mb-6">
        <UiCheckbox v-model:checked="checkpointForm.visa">
          ຮັບ Visa
        </UiCheckbox>
        <UiCheckbox v-model:checked="checkpointForm.e_visa">
          ຮັບ E-Visa
        </UiCheckbox>
      </div>

      <!-- Tab Content -->
      <Tab v-model:activeKey="activeTab" :tabs="TABS_CONFIG">
        <template v-for="tab in TABS_CONFIG" :key="tab.key" #[tab.slotName]>
          <UiFormItem
            :name="`translates.${tab.lang}.name`"
            label="ຊື່ດ່ານ"
            required
          >
            <UiInput
              v-model="checkpointForm.translates[tab.lang].name"
              placeholder="ປ້ອນຊື່ດ່ານ"
              size="large"
            />
          </UiFormItem>

          <UiFormItem
            :name="`translates.${tab.lang}.time_operation`"
            label="ເວລາເປີດ-ປິດ"
          >
            <UiInput
              v-model="checkpointForm.translates[tab.lang].time_operation"
              placeholder="ປ້ອນເວລາເປີດ-ປິດ"
              size="large"
            />
          </UiFormItem>

          <UiFormItem :name="`translates.${tab.lang}.address`" label="ທີ່ຢູ່">
            <Textarea
              v-model="checkpointForm.translates[tab.lang].address"
              placeholder="ປ້ອນທີ່ຢູ່"
              :rows="3"
              size="large"
            />
          </UiFormItem>

          <UiFormItem :name="`translates.${tab.lang}.content`" label="ເນື້ອຫາ">
            <QuillEditorComponent
              v-model="checkpointForm.translates[tab.lang].content"
              placeholder="ປ້ອນເນື້ອຫາ..."
            />
          </UiFormItem>
        </template>
      </Tab>

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
</style>
