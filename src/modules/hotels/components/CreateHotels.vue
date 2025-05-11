<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useHotelsStore } from "../store/hotels.store";
import { useNotification } from "@/utils/notificationService";
import type { HotelForm } from "../interface/hotels.interface";
import { validationSchema } from "../validation/hotel.validation";
import { useAuthStore } from "@/lib/stores/auth.store";
import { HOTEL_WRITE } from "@/common/utils/PermissionGroup";
import HasPermission from "@/components/CheckPermission/HasPermission.vue";
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
const authStore = useAuthStore();
const router = useRouter();
const { openNotification } = useNotification();
// Reactive state variables
const isLoading = ref<boolean>(false);
const activeTab = ref<string>("1");
const formRef = ref<any>(null);
const selectedImage = ref<File | null>(null);
const hasUserAccess = ref<boolean>(false);
const canWriteHotel = computed(() => authStore.hasPermission(HOTEL_WRITE));
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
  if (!canWriteHotel.value) {
    openNotification("error", "ຂໍ້ຜິດພາດ", "ທ່ານບໍ່ມີສິດເພີ່ມຂໍ້ມູນໂຮງແຮມ");
    return;
  }
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
const goBack = () => {
  router.push({ name: "hotels" });
};

onMounted(() => {
  if (!canWriteHotel.value) {
    openNotification("error", "ຂໍ້ຜິດພາດ", "ທ່ານບໍ່ມີສິດເພີ່ມຂໍ້ມູນໂຮງແຮມ");
    router.push({ name: "hotels" });
  }
});
</script>
<template>
  <HasPermission :permission="HOTEL_WRITE">
    <div class="hotel-form-container">
      <div class="flex justify-between items-center mb-4 mt-12">
        <div class="flex items-center gap-4">
          <UiButton
            @click="goBack"
            type="default"
            class="flex items-center gap-1"
            icon="material-symbols:arrow-back"
          >
            ກັບຄືນ
          </UiButton>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            ເພີ່ມໂຮງແຮມໃໝ່
          </h2>
        </div>
      </div>

      <!-- Loading state -->
      <LoadingSpinner v-if="isLoading" class="relative h-[80vh]" />
      <UiForm
        v-else
        ref="formRef"
        :model="formData"
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
      >
        <!-- Language Tabs Section -->
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
              <UiFormItem label="ແຂວງ" name="lo.province">
                <UiInput
                  v-model="formData.lo.province"
                  placeholder="ປ້ອນແຂວງ"
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
              <UiFormItem label="ບ້ານ" name="lo.village">
                <UiInput
                  v-model="formData.lo.village"
                  placeholder="ປ້ອນບ້ານ"
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
                placeholder="Enter hotel name"
                allowClear
                size="large"
              />
            </UiFormItem>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UiFormItem label="ແຂວງ" name="en.province">
                <UiInput
                  v-model="formData.en.province"
                  placeholder="Enter province"
                  allowClear
                  size="large"
                />
              </UiFormItem>
              <UiFormItem label="ເມືອງ" name="en.district">
                <UiInput
                  v-model="formData.en.district"
                  placeholder="Enter district"
                  allowClear
                  size="large"
                />
              </UiFormItem>
              <UiFormItem label="ບ້ານ" name="en.village">
                <UiInput
                  v-model="formData.en.village"
                  placeholder="Enter village"
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
                placeholder="输入酒店名称"
                allowClear
                size="large"
              />
            </UiFormItem>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UiFormItem label="ແຂວງ" name="zh_cn.province">
                <UiInput
                  v-model="formData.zh_cn.province"
                  placeholder="输入省份"
                  allowClear
                  size="large"
                />
              </UiFormItem>
              <UiFormItem label="ເມືອງ" name="zh_cn.district">
                <UiInput
                  v-model="formData.zh_cn.district"
                  placeholder="输入区"
                  allowClear
                  size="large"
                />
              </UiFormItem>
              <UiFormItem label="ບ້ານ" name="zh_cn.village">
                <UiInput
                  v-model="formData.zh_cn.village"
                  placeholder="输入村"
                  allowClear
                  size="large"
                />
              </UiFormItem>
            </div>
          </template>
        </Tab>

        <!-- Image Upload Section -->
        <UploadDragger
          @onFileSelect="handleFileSelect"
          accept="image/png,image/jpeg,image/jpg"
        /><br />

        <!-- Contact and Publication Settings Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <!-- Submit and Reset Buttons -->
        <div class="flex justify-start gap-4">
          <UiButton
            @click="handleSubmit"
            type="submit"
            size="large"
            :loading="isLoading"
            colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
            icon="material-symbols:add"
          >
            <span class="i-mdi-content-save text-xl" aria-hidden="true"></span>
            ເພີ່ມໂຮງແຮມ
          </UiButton>
        </div>
      </UiForm>
    </div>
    <!-- แสดงข้อความเมื่อไม่มีสิทธิ์เพิ่มโรงแรม -->
    <template #fallback>
      <div class="flex flex-col items-center justify-center h-screen">
        <div class="text-6xl text-gray-300 mb-4">
          <i class="fas fa-lock"></i>
        </div>
        <h2 class="text-xl font-medium text-gray-700 mb-2">
          ທ່ານບໍ່ມີສິດເພີ່ມຂໍ້ມູນໂຮງແຮມ
        </h2>
        <p class="text-gray-500 mb-6">
          ກະລຸນາຕິດຕໍ່ຜູ້ດູແລລະບົບຖ້າທ່ານເຊື່ອວ່ານີ້ແມ່ນຂໍ້ຜິດພາດ
        </p>
        <UiButton
          @click="goBack"
          type="primary"
          class="flex items-center gap-1"
          size="large"
        >
          ກັບຄືນໜ້າຫຼັກ
        </UiButton>
      </div>
    </template>
  </HasPermission>
</template>
<style scoped></style>
