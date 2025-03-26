<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCheckpointProvinceStore } from "../store/province.store";
import { useNotification } from "@/utils/notificationService";
import { useCountryStore } from "@/modules/countries/store/country.store";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiInput from "@/components/Input/UiInput.vue";
import Tab from "@/components/Tab/Tab.vue";
import UiButton from "@/components/button/UiButton.vue";
import CustomCheckbox from "@/components/Checkbox/UiCheckbox.vue";

// Type definitions
type LanguageKeys = "lo" | "en" | "zh_cn";
type Country = {
  label: string;
  value: number;
};

// Store and router hooks
const { createCheckpointProvince } = useCheckpointProvinceStore();
const { getCountryById, getAllCountry } = useCountryStore();
const { push } = useRouter();
const { openNotification } = useNotification();

// Reactive state
const isLoading = ref(false);
const activeTab = ref("1");
const formRef = ref();
const selectedCountries = ref<number[]>([]);

// Predefined countries
const countryOptions: Country[] = [
  { label: "Vietnam", value: 1 },
  { label: "Cambodia", value: 2 },
  { label: "Thailand", value: 3 },
  { label: "Myanmar", value: 4 },
  { label: "China", value: 5 },
];

// Tabs configuration
const tabsConfig = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3" },
];

// Slugs and form data
const slugs = reactive({
  lo: "",
  en: "",
  zh_cn: "",
});

const formData = reactive<Record<LanguageKeys, { name: string }>>({
  lo: { name: "" },
  en: { name: "" },
  zh_cn: { name: "" },
});

// Generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");
};

// Update name and slug
const updateName = (lang: LanguageKeys, value: string) => {
  formData[lang].name = value;
  slugs[lang] = generateSlug(value);
};

// Handle form submission
const handleSubmit = async () => {
  try {
    // Validate form
    const valid = await formRef.value?.submitForm();
    if (!valid) return;

    // Check if countries are selected
    if (selectedCountries.value.length === 0) {
      openNotification("error", "ເລືອກປະເທດ", "ກະລຸນາເລືອກຢ່າງໜ້ອຍ 1 ປະເທດ");
      return;
    }

    // Prepare submission data
    const submissionData = {
      country_ids: selectedCountries.value,
      lo: formData.lo,
      en: formData.en,
      zh_cn: formData.zh_cn,
    };

    // Start loading
    isLoading.value = true;

    // Save data through store
    await createCheckpointProvince(submissionData);

    // Show success notification
    openNotification("success", "ເພີ່ມປະເພດດ່ານ", "ເພີ່ມສຳເລັດ");

    // Navigate back to checkpoint categories
    push({ name: "checkpointCategories" });
  } catch (error) {
    // Handle and log errors
    console.error("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ:", error);
    openNotification(
      "error",
      "ເກີດຂໍ້ຜິດພາດ",
      "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ ກະລຸນາລອງອີກຄັ້ງ"
    );
  } finally {
    // End loading
    isLoading.value = false;
  }
};
</script>

<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white mt-12">
    ເພີ່ມຂໍ້ມູນແຂວງ
  </h2>
  <div>
    <UiForm ref="formRef" :model="formData">
      <Tab v-model="activeTab" :tabs="tabsConfig">
        <!-- Lao Language Tab -->
        <template #tab1>
          <UiFormItem label="ຊື່ແຂວງ" name="lo_name">
            <UiInput
              v-model="formData.lo.name"
              @update:modelValue="(val) => updateName('lo', val)"
              placeholder="ປ້ອນຊື່ແຂວງ"
              allowClear
              size="large"
            />
          </UiFormItem>
        </template>

        <!-- English Language Tab -->
        <template #tab2>
          <UiFormItem label="ຊື່ແຂວງ" name="en_name">
            <UiInput
              v-model="formData.en.name"
              @update:modelValue="(val) => updateName('en', val)"
              placeholder="ປ້ອນຊື່ແຂວງ"
              allowClear
              size="large"
            />
          </UiFormItem>
        </template>

        <!-- Chinese Language Tab -->
        <template #tab3>
          <UiFormItem label="ຊື່ແຂວງ" name="zh_cn_name">
            <UiInput
              v-model="formData.zh_cn.name"
              @update:modelValue="(val) => updateName('zh_cn', val)"
              placeholder="ປ່ອນຊື່ແຂວງ"
              allowClear
              size="large"
            />
          </UiFormItem>
        </template>
      </Tab>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2">
          ເລືອກປະເທດ
        </label>
        <CustomCheckbox v-model="selectedCountries" :options="countryOptions" />
      </div>
      <UiButton
        @click="handleSubmit"
        type="submit"
        size="large"
        :loading="isLoading"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
      >
        ເພີ່ມແຂວງ
      </UiButton>
    </UiForm>
  </div>
</template>
