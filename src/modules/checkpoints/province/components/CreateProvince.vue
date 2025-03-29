<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useCheckpointProvinceStore } from "../store/province.store";
import { useNotification } from "@/utils/notificationService";
import { rulesProvince } from "../validation/province.validation";
import * as Yup from "yup";
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
  value: string | number;
};

// Store and router hooks
const { createCheckpointProvince } = useCheckpointProvinceStore();
const { push } = useRouter();
const { openNotification } = useNotification();

// Reactive state
const isLoading = ref(false);
const activeTab = ref("1");
const formRef = ref();
const selectedCountries = ref<string[]>([]);

// Predefined countries
const countryOptions: Country[] = [
  { label: "Vietnam", value: "vietnam" },
  { label: "Cambodia", value: "cambodia" },
  { label: "Thailand", value: "thailand" },
  { label: "Myanmar", value: "myanmar" },
  { label: "China", value: "china" },
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
const handleSubmit = async () => {
  try {
    // Validate form using Yup
    await rulesProvince.validate(formData, { abortEarly: false });

    // Check if countries are selected
    if (selectedCountries.value.length === 0) {
      openNotification("error", "ກະລຸນາປ້ອນຂໍ້ມູນ", "ປ້ອນຂໍ້ມູນໃຫ້ຄົບກ່ອນ");
      return;
    }

    // Prepare submission data
    const submissionData = {
      countries: selectedCountries.value,
      lo: formData.lo,
      en: formData.en,
      zh_cn: formData.zh_cn,
    };

    // Start loading
    isLoading.value = true;

    // Save data through store
    await createCheckpointProvince(submissionData);

    // Show success notification
    openNotification("success", "ເພີ່ມແຂວງ", "ເພີ່ມສຳເລັດ");

    // Navigate back to checkpoint categories
    push({ name: "provinces" });
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      // Handle validation errors
      console.error(error.errors); // You can show these errors in your UI
      openNotification(
        "error",
        "ກະລຸນາປ້ອນຂໍ້ມູນຕາມກົດກຳນົດ",
        error.errors.join(", ")
      );
    } else {
      // Handle other errors
      console.error("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ:", error);
      openNotification(
        "error",
        "ເກີດຂໍ້ຜິດພາດ",
        "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ ກະລຸນາລອງອີກຄັ້ງ"
      );
    }
  } finally {
    // End loading
    isLoading.value = false;
  }
};
// Handle form submission
// const handleSubmit = async () => {
//   try {
//     // Validate form
//     const isValid = await formRef.value?.submitForm();
//     if (!isValid) return;

//     // Check if countries are selected
//     if (selectedCountries.value.length === 0) {
//       openNotification("error", "ກະລຸນາປ້ອນຂໍ້ມູນ", "ປ້ອນຂໍ້ມູນໃຫ້ຄົບກ່ອນ");
//       return;
//     }

//     // Prepare submission data
//     const submissionData = {
//       countries: selectedCountries.value,
//       lo: formData.lo,
//       en: formData.en,
//       zh_cn: formData.zh_cn,
//     };

//     // Start loading
//     isLoading.value = true;

//     // Save data through store
//     await createCheckpointProvince(submissionData);

//     // Show success notification
//     openNotification("success", "ເພີ່ມແຂວງ", "ເພີ່ມສຳເລັດ");

//     // Navigate back to checkpoint categories
//     push({ name: "provinces" });
//   } catch (error) {
//     // Handle and log errors
//     console.error("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ:", error);
//     openNotification(
//       "error",
//       "ເກີດຂໍ້ຜິດພາດ",
//       "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ ກະລຸນາລອງອີກຄັ້ງ"
//     );
//   } finally {
//     // End loading
//     isLoading.value = false;
//   }
// };
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
          <UiFormItem label="ຊື່ແຂວງ" name="lo.name">
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
          <UiFormItem label="ຊື່ແຂວງ" name="en.name">
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
          <UiFormItem label="ຊື່ແຂວງ" name="zh_cn.name">
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
          ຊາຍແດນຕິດກັບປະເທດ
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
