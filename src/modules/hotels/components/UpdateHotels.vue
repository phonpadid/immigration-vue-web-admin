<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useHotelsStore } from "../store/hotels.store";
import { useNotification } from "@/utils/notificationService";
import type { HotelForm } from "../interface/hotels.interface";
import { updateValidationSchema } from "../validation/hotel.validation";
import { imageBaseUrl } from "@/utils/ConfigPathImage";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";
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
const route = useRoute();
const { openNotification } = useNotification();
const hotelId = computed(() => Number(route.params.id));
const isLoading = ref<boolean>(false);
const activeTab = ref<string>("1");
const formRef = ref<any>(null);
const selectedImage = ref<File | null>(null);
const hasUserAccess = ref<boolean>(false);
const originalImageUrl = ref<string>("");
const validationSchema = updateValidationSchema(hasUserAccess.value);
const fullImageUrl = computed(() => {
  if (!originalImageUrl.value) return "";
  if (
    originalImageUrl.value.startsWith("http://") ||
    originalImageUrl.value.startsWith("https://")
  ) {
    return originalImageUrl.value;
  }
  return `${imageBaseUrl}/${originalImageUrl.value.replace(/^\//, "")}`;
});

// Tabs configuration for language support
const tabsConfig = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3" },
];

// Form data structure with IDs for languages and user
const formData = reactive({
  lo: { id: 0, name: "", province: "", district: "", village: "" },
  en: { id: 0, name: "", province: "", district: "", village: "" },
  zh_cn: { id: 0, name: "", province: "", district: "", village: "" },
  is_published: false,
  image: null as File | null,
  link: "",
  phone_number: "",
  user: {
    id: 0,
    email: "",
    password: "",
  },
});

// Load hotel data on component mount
onMounted(async () => {
  if (!hotelId.value) {
    openNotification("error", "ຜິດພາດ", "ບໍ່ພົບ ID ຂອງໂຮງແຮມ");
    router.push({ name: "hotels" });
    return;
  }

  try {
    isLoading.value = true;
    const hotel = await hotelsStore.getHotelsById(hotelId.value);

    if (!hotel) {
      openNotification("error", "ຜິດພາດ", "ບໍ່ພົບຂໍ້ມູນໂຮງແຮມ");
      router.push({ name: "hotels" });
      return;
    }
    // Store original image URL
    if (hotel.image) {
      originalImageUrl.value = hotel.image;
    }
    // Set up basic fields
    formData.link = hotel.link || "";
    formData.phone_number = hotel.phone_number || "";
    // Handle is_published - convert from string "1"/"0" to boolean if needed
    formData.is_published =
      typeof hotel.is_published === "string"
        ? hotel.is_published === "1"
        : !!hotel.is_published;
    // Process translates data with IDs
    if (hotel.translates && Array.isArray(hotel.translates)) {
      hotel.translates.forEach((translate: any) => {
        if (translate.lang === "lo") {
          formData.lo = {
            id: translate.id || 0,
            name: translate.name || "",
            province: translate.province || "",
            district: translate.district || "",
            village: translate.village || "",
          };
        } else if (translate.lang === "en") {
          formData.en = {
            id: translate.id || 0,
            name: translate.name || "",
            province: translate.province || "",
            district: translate.district || "",
            village: translate.village || "",
          };
        } else if (translate.lang === "zh_cn") {
          formData.zh_cn = {
            id: translate.id || 0,
            name: translate.name || "",
            province: translate.province || "",
            district: translate.district || "",
            village: translate.village || "",
          };
        }
      });
    }
    // Handle user data including ID
    if (hotel.user) {
      formData.user = {
        id: hotel.user.id || 0,
        email: hotel.user.email || "",
        password: "", // ไม่ส่งรหัสผ่านเดิม
      };
      hasUserAccess.value = true;
    }
  } catch (error) {
    console.error("Failed to fetch hotel data:", error);
    openNotification("error", "ຜິດພາດ", "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
  } finally {
    isLoading.value = false;
  }
});

// Handle image file selection
const handleFileSelect = (file: File) => {
  selectedImage.value = file;
  formData.image = file;
};

// Toggle user access fields visibility
const toggleUserAccess = (value: boolean) => {
  hasUserAccess.value = value;
  if (!value) {
    // Reset user data when disabling
    formData.user = {
      id: 0,
      email: "",
      password: "",
    };
  }
};
// Handle form submission
const handleSubmit = async () => {
  try {
    const validationData = {
      ...formData,
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

    // Prepare data for API submission
    const hotelData: Partial<HotelForm> = {
      id: hotelId.value,
      link: formData.link,
      phone_number: formData.phone_number,
      is_published: formData.is_published ? "1" : "0",
      lo: formData.lo,
      en: formData.en,
      zh_cn: formData.zh_cn,
    };
    if (selectedImage.value) {
      hotelData.image = selectedImage.value;
    }
    if (hasUserAccess.value) {
      const userData: any = {
        id: formData.user.id,
        email: formData.user.email,
      };

      if (formData.user.password && formData.user.password.trim() !== "") {
        userData.password = formData.user.password;
      }
      hotelData.user = userData;
    }
    await hotelsStore.updateHotels(hotelId.value, hotelData);
    router.push({ name: "hotels" });
    openNotification("success", "ອັບເດດໂຮງແຮມ", "ອັບເດດສຳເລັດ");
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      const errorMessages = error.errors.join(", ");
      openNotification("error", "ການຢືນຢັນຜິດພາດ", errorMessages);
    } else {
      console.error("Failed to update hotel data:", error);
      openNotification(
        "error",
        "ເກີດຂໍ້ຜິດພາດ",
        "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນ ກະລຸນາລອງອີກຄັ້ງ"
      );
    }
  } finally {
    isLoading.value = false;
  }
};
</script>
<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white mt-12">
    ອັບເດດຂໍ້ມູນໂຮງແຮມ
  </h2>
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
      :existing-image-url="fullImageUrl"
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
            placeholder="ປ່ອຍໄວ້ຫວ່າງຖ້າບໍ່ຕ້ອງການປ່ຽນລະຫັດຜ່ານ"
            type="password"
            allowClear
            size="large"
            prefix="🔒"
          />
          <div class="text-xs text-gray-500 mt-1">
            * ຫາກບໍ່ປ້ອນລະຫັດຜ່ານ, ລະບົບຈະໃຊ້ລະຫັດຜ່ານເດີມ
          </div>
        </UiFormItem>
      </div>
    </div>
    <!-- Submit Button -->
    <div class="flex justify-start gap-4">
      <UiButton
        @click="handleSubmit"
        type="submit"
        size="large"
        :loading="isLoading"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
        icon="material-symbols:edit-square"
      >
        <span class="i-mdi-content-save text-xl" aria-hidden="true"></span>
        ອັບເດດໂຮງແຮມ
      </UiButton>
      <UiButton
        colorClass="!bg-red-700 hover:!bg-red-900 text-white flex items-center"
        type="default"
        size="large"
        class="mr-3"
        icon="material-symbols:delete-outline-sharp"
      >
        ລຶບ
      </UiButton>
    </div>
  </UiForm>
</template>

<style scoped>
.hotel-form-container {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loader {
  border: 4px solid #f3f3f3;
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Additional styling for dark mode compatibility */
:deep(.ant-card) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
}

:deep(.dark .ant-card) {
  background: #1f2937;
  border-color: #374151;
}

:deep(.dark .ant-card-head) {
  border-bottom: 1px solid #374151;
}

:deep(.ant-divider) {
  border-color: #e5e7eb;
}

:deep(.dark .ant-divider) {
  border-color: #4b5563;
}
</style>
