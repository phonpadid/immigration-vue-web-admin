<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useCheckpointProvinceStore } from "../store/province.store";
import { useNotification } from "@/utils/notificationService";
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
  value: string;
};

// Store and router hooks
const { getCheckpointProvinceById, updateCheckpointProcines } =
  useCheckpointProvinceStore();
const router = useRouter();
const route = useRoute();
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

// Form data
const formData = reactive<{
  id?: number;
  translates: Array<{
    id?: number;
    lang: LanguageKeys;
    name: string;
    slug?: string;
  }>;
  countries: string[];
}>({
  translates: [
    { lang: "lo", name: "", id: undefined },
    { lang: "en", name: "", id: undefined },
    { lang: "zh_cn", name: "", id: undefined },
  ],
  countries: [],
});

// Fetch province data on component mount
onMounted(async () => {
  try {
    const provinceId = Number(route.params.id);
    const provinceData = await getCheckpointProvinceById(provinceId);

    if (provinceData) {
      // Set province ID
      formData.id = provinceData.id;

      // Set names from translates
      provinceData.translates.forEach((translate: any) => {
        const index = formData.translates.findIndex(
          (t) => t.lang === translate.lang
        );
        if (index !== -1) {
          formData.translates[index].name = translate.name;
          formData.translates[index].slug = translate.slug;
          formData.translates[index].id = translate.id;
        }
      });

      // Set selected countries
      formData.countries = provinceData.countries.map(
        (country: any) => country.country
      );
      selectedCountries.value = formData.countries;
    }
  } catch (error) {
    console.error("Error fetching province data:", error);
    openNotification("error", "ເກີດຂໍ້ຜິດພາດ", "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
  }
});

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
      countries: selectedCountries.value,
      lo: {
        id: formData.translates.find((t) => t.lang === "lo")?.id,
        name: formData.translates.find((t) => t.lang === "lo")?.name || "",
      },
      en: {
        id: formData.translates.find((t) => t.lang === "en")?.id,
        name: formData.translates.find((t) => t.lang === "en")?.name || "",
      },
      zh_cn: {
        id: formData.translates.find((t) => t.lang === "zh_cn")?.id,
        name: formData.translates.find((t) => t.lang === "zh_cn")?.name || "",
      },
    };

    // Start loading
    isLoading.value = true;

    // Update data through store
    await updateCheckpointProcines(formData.id!, submissionData);

    // Show success notification
    openNotification("success", "ແກ້ໄຂແຂວງ", "ແກ້ໄຂສຳເລັດ");

    // Navigate back to provinces list
    router.push({ name: "provinces" });
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
    ອັບເດດຂໍ້ມູນແຂວງ
  </h2>
  <div>
    <UiForm ref="formRef" :model="formData">
      <Tab v-model="activeTab" :tabs="tabsConfig">
        <!-- Lao Language Tab -->
        <template #tab1>
          <UiFormItem label="ຊື່ແຂວງ" name="lo_name">
            <UiInput
              v-model="formData.translates.find(t => t.lang === 'lo')!.name"
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
              v-model="formData.translates.find(t => t.lang === 'en')!.name"
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
              v-model="formData.translates.find(t => t.lang === 'zh_cn')!.name"
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
        ອັບເດດແຂວງ
      </UiButton>
    </UiForm>
  </div>
</template>
