<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
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

// Store and router hooks
const countryStore = useCountryStore();
const router = useRouter();
const { openNotification } = useNotification();

// Reactive state
const isLoading = ref(false);
const activeTab = ref("1");
const formRef = ref();
const selectedImage = ref<File | null>(null);

// Tabs configuration
const tabsConfig = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3" },
];

// Form validation schema
const validationSchema = Yup.object().shape({
  lo: Yup.object().shape({
    name: Yup.string().required("ກະລຸນາປ້ອນຊື່ປະເທດ"),
    description: Yup.string().optional(),
  }),
  en: Yup.object().shape({
    name: Yup.string().required("Please enter country name"),
    description: Yup.string().optional(),
  }),
  zh_cn: Yup.object().shape({
    name: Yup.string().required("请输入国家名称"),
    description: Yup.string().optional(),
  }),
  image: Yup.mixed().required("ກະລຸນາອັບໂຫຼດຮູບພາບ"),
});

// Reactive form data
const formData = reactive({
  lo: { name: "", description: "" },
  en: { name: "", description: "" },
  zh_cn: { name: "", description: "" },
  is_except_visa: false,
  image: null as File | null,
});

// Handle file selection
const handleFileSelect = (file: File) => {
  selectedImage.value = file;
  formData.image = file;
};

// Form submission handler
const handleSubmit = async () => {
  try {
    // Validate form data
    await validationSchema.validate(
      { ...formData, image: selectedImage.value },
      { abortEarly: false }
    );

    // Start loading
    isLoading.value = true;

    // Create country
    await countryStore.createCountry({
      lo: formData.lo,
      en: formData.en,
      zh_cn: formData.zh_cn,
      is_except_visa: formData.is_except_visa,
      image: selectedImage.value!,
    });

    // Show success notification
    openNotification("success", "ເພີ່ມປະເທດ", "ເພີ່ມສຳເລັດ");

    // Navigate back to countries list
    router.push({ name: "countries" });
  } catch (error) {
    // Handle validation or submission errors
    if (error instanceof Yup.ValidationError) {
      const errorMessages = error.errors.join(", ");
      openNotification("error", "ການຢືນຢັນຜິດພາດ", errorMessages);
    } else {
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
</script>

<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white mt-12">
    ເພີ່ມຂໍ້ມູນປະເທດ
  </h2>
  <div>
    <UiForm ref="formRef" :model="formData">
      <Tab v-model="activeTab" :tabs="tabsConfig">
        <!-- Lao Language Tab -->
        <template #tab1>
          <UiFormItem label="ຊື່ປະເທດ" name="lo.name">
            <UiInput
              v-model="formData.lo.name"
              placeholder="ປ້ອນຊື່ປະເທດ"
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
              placeholder="ປ້ອນຊື່ປະເທດ"
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
              placeholder="ປ້ອນຊື່ປະເທດ"
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
        v-model:fileList="formData.image"
        @onFileSelect="handleFileSelect"
      />
      <div class="grid gap-4 my-4 md:grid-cols-2 md:gap-6">
        <Switch
          v-model="formData.is_except_visa"
          label="ຍົກເວັ້ນວິຊາ"
          name="is_except_visa"
        />
      </div>

      <UiButton
        @click="handleSubmit"
        type="submit"
        size="large"
        :loading="isLoading"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
      >
        ເພີ່ມປະເທດ
      </UiButton>
    </UiForm>
  </div>
</template>
