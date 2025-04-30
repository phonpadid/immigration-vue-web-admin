<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useHotelsStore } from "../store/hotels.store";
import { useNotification } from "@/utils/notificationService";
import type { HotelForm } from "../interface/hotels.interface";
import { validationSchema } from "../validation/hotel.validation";
import * as Yup from "yup";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiInput from "@/components/Input/UiInput.vue";
import Tab from "@/components/Tab/Tab.vue";
import UiButton from "@/components/button/UiButton.vue";
import UploadDragger from "@/components/Upload/UploadDragger.vue";
import Switch from "@/components/Switch/Switch.vue";

// Store and router setup
const hotelsStore = useHotelsStore();
const router = useRouter();
const { openNotification } = useNotification();
// Reactive state variables
const isLoading = ref<boolean>(false);
const activeTab = ref<string>("1");
const formRef = ref<any>(null);
const selectedImage = ref<File | null>(null);
const hasUserAccess = ref<boolean>(false);
// Tabs configuration for language support
const tabsConfig = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3" },
];
// Form data structure
const formData = reactive({
  lo: { name: "", province: "", district: "", village: "" },
  en: { name: "", province: "", district: "", village: "" },
  zh_cn: { name: "", province: "", district: "", village: "" },
  is_published: false,
  image: null as File | null,
  link: "",

  phone_number: "",
  user: {
    email: "",
    password: "",
  },
});
// Handle image file selection
const handleFileSelect = (file: File) => {
  selectedImage.value = file;
  formData.image = file;
};
// Toggle user access fields visibility
const toggleUserAccess = (value: boolean) => {
  hasUserAccess.value = value;
};
// Handle form submission
const handleSubmit = async () => {
  try {
    const validationData = {
      ...formData,
      image: selectedImage.value,
    };
    if (hasUserAccess.value) {
      await validationSchema.value.validate(validationData, {
        abortEarly: false,
      });
    } else {
      const { user, ...dataWithoutUser } = validationData;
      await validationSchema.value.validate(dataWithoutUser, {
        abortEarly: false,
      });
    }
    isLoading.value = true;
    const hotelData: HotelForm = {
      image: selectedImage.value,
      link: formData.link,

      phone_number: formData.phone_number,
      is_published: formData.is_published ? "1" : "0",
      lo: formData.lo,
      en: formData.en,
      zh_cn: formData.zh_cn,
    };
    if (hasUserAccess.value) {
      hotelData.user = formData.user;
    }
    await hotelsStore.createHotels(hotelData);
    openNotification("success", "ເພີ່ມໂຮງແຮມ", "ເພີ່ມສຳເລັດ");
    router.push({ name: "hotels" });
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      const errorMessages = error.errors.join(", ");
      openNotification("error", "ການຢືນຢັນຜິດພາດ", errorMessages);
    } else {
      console.error("Failed to submit hotel data:", error);
      openNotification(
        "error",
        "ເກີດຂໍ້ຜິດພາດ",
        "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ ກະລຸນາລອງອີກຄັ້ງ"
      );
    }
  } finally {
    isLoading.value = false;
  }
};
</script>
<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white mt-12">
    ເພີ່ມຂໍ້ມູນໂຮງແຮມ
  </h2>
  <UiForm
    ref="formRef"
    :model="formData"
    class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
  >
    <Tab v-model:activeKey="activeTab" :tabs="tabsConfig">
      <!-- Lao Language Tab -->
      <template #tab1>
        <UiFormItem label="ຊື່ໂຮງແຮມ" name="lo.name">
          <UiInput
            v-model="formData.lo.name"
            placeholder="ປ້ອນຊື່ໂຮງແຮມ"
            allowClear
            size="large"
          />
        </UiFormItem>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UiFormItem label="ບ້ານ" name="lo.village">
            <UiInput
              v-model="formData.lo.village"
              placeholder="ປ້ອນບ້ານ"
              allowClear
              size="large"
            />
          </UiFormItem>
          <UiFormItem label="ເມືອງ" name="lo.district">
            <UiInput
              v-model="formData.lo.district"
              placeholder="ປ້ອນເມືອງ"
              allowClear
              size="large"
            />
          </UiFormItem>
          <UiFormItem label="ແຂວງ" name="lo.province">
            <UiInput
              v-model="formData.lo.province"
              placeholder="ປ້ອນແຂວງ"
              allowClear
              size="large"
            />
          </UiFormItem>
        </div>
      </template>
      <!-- English Language Tab -->
      <template #tab2>
        <UiFormItem label="ຊື່ໂຮງແຮມ" name="en.name">
          <UiInput
            v-model="formData.en.name"
            placeholder="ປ້ອນຊື່ໂຮງແຮມ"
            allowClear
            size="large"
          />
        </UiFormItem>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UiFormItem label="ບ້ານ" name="en.village">
            <UiInput
              v-model="formData.en.village"
              placeholder="ປ້ອນບ້ານ"
              allowClear
              size="large"
            />
          </UiFormItem>
          <UiFormItem label="ເມືອງ" name="en.district">
            <UiInput
              v-model="formData.en.district"
              placeholder="ປ້ອນເມືອງ"
              allowClear
              size="large"
            />
          </UiFormItem>
          <UiFormItem label="ແຂວງ" name="en.province">
            <UiInput
              v-model="formData.en.province"
              placeholder="ປ້ອນແຂວງ"
              allowClear
              size="large"
            />
          </UiFormItem>
        </div>
      </template>
      <!-- Chinese Language Tab -->
      <template #tab3>
        <UiFormItem label="ຊື່ໂຮງແຮມ" name="zh_cn.name">
          <UiInput
            v-model="formData.zh_cn.name"
            placeholder="ປ້ອນຊື່ໂຮງແຮມ"
            allowClear
            size="large"
          />
        </UiFormItem>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UiFormItem label="ບ້ານ" name="zh_cn.village">
            <UiInput
              v-model="formData.zh_cn.village"
              placeholder="ປ້ອນບ້ານ"
              allowClear
              size="large"
            />
          </UiFormItem>
          <UiFormItem label="ເມືອງ" name="zh_cn.district">
            <UiInput
              v-model="formData.zh_cn.district"
              placeholder="ປ້ອນເມືອງ"
              allowClear
              size="large"
            />
          </UiFormItem>
          <UiFormItem label="ແຂວງ" name="zh_cn.province">
            <UiInput
              v-model="formData.zh_cn.province"
              placeholder="ປ້ອນແຂວງ"
              allowClear
              size="large"
            />
          </UiFormItem>
        </div>
      </template>
    </Tab>
    <UploadDragger
      v-model:fileList="formData.image"
      @onFileSelect="handleFileSelect"
      accept="image/png,image/jpeg,image/jpg"
    />
    <br />
    <div class="grid gap-4 mb-4 sm:mb-8 md:grid-cols-2 md:gap-6">
      <!-- Links -->
      <div>
        <UiFormItem label="ລິ້ງໂຮງແຮມ" name="link" class="mb-4">
          <UiInput
            v-model="formData.link"
            placeholder="https://example.com"
            allowClear
            size="large"
            prefix="🔗"
          />
        </UiFormItem>
      </div>
      <Switch
        v-model="formData.is_published"
        label="ການມອງເຫັນ"
        name="is_published"
        class="mb-4"
      />
      <!-- Phone and Publication -->
      <UiFormItem label="ເບີໂທລະສັບ" name="phone_number" class="mb-4">
        <UiInput
          v-model="formData.phone_number"
          placeholder="+856 20 XXXXXXXX"
          allowClear
          size="large"
          prefix="📞"
        />
      </UiFormItem>
      <Switch
        v-model="hasUserAccess"
        label="ມີແອັດມິນ"
        name="has_user_access"
        @change="toggleUserAccess"
        class="mb-4"
      />
    </div>
    <!-- User credentials (visible only when hasUserAccess is true) -->
    <div v-if="hasUserAccess" class="mt-3">
      <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
        ຂໍ້ມູນຜູ້ຈັດການໂຮງແຮມ
      </h2>
      <div class="grid gap-4 mb-4 sm:mb-8 md:grid-cols-2 md:gap-6">
        <UiFormItem label="ອີເມວ" name="user.email" class="mb-3">
          <UiInput
            v-model="formData.user.email"
            placeholder="email@example.com"
            allowClear
            size="large"
            prefix="📧"
          />
        </UiFormItem>
        <UiFormItem label="ລະຫັດຜ່ານ" name="user.password">
          <UiInput
            v-model="formData.user.password"
            placeholder="ປ້ອນລະຫັດຜ່ານ"
            type="password"
            allowClear
            size="large"
            prefix="🔒"
          />
        </UiFormItem>
      </div>
    </div>
    <!-- Submit Button -->
    <div class="flex justify-start mt-6">
      <UiButton
        @click="handleSubmit"
        type="submit"
        size="large"
        :loading="isLoading"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center gap-2"
      >
        <span class="i-mdi-plus text-xl" aria-hidden="true"></span>
        ເພີ່ມໂຮງແຮມ
      </UiButton>
    </div>
  </UiForm>
</template>
<style scoped></style>
