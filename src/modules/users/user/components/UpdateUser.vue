<script setup lang="ts">
import { reactive, ref, watch, computed, onMounted } from "vue";
import type { UserForm } from "../interface/user.interface";
import { rulesUser } from "../validation/user.validation";
import { useUserStore } from "../store/user.store";
import { useRolesStore } from "../../role/store/role.store";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { useNotification } from "@/utils/notificationService";
import UploadFile from "@/components/Upload/UploadFile.vue";
import UiInput from "@/components/Input/UiInput.vue";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import InputSelect from "@/components/Input/InputSelect.vue";
import UiInputPassword from "@/components/Input/UiInputPassword.vue";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";

//***************************************************************** */
// Initialize stores
const { openNotification } = useNotification();
const userStore = useUserStore();
const roleStore = useRolesStore();
const route = useRoute();
const router = useRouter();
const formRef = ref();
const userId = computed(() => route.params.id as string);
// Track if image has been changed
const imageChanged = ref(false);
// Track if password should be updated
const updatePassword = ref(false);

// Current user image URL
const currentImageUrl = ref("");

// Loading states
const isSubmitting = ref(false);
const isLoading = ref(true);

// Reactive state for errors
const errors = ref({
  file: null as string | null,
  role_ids: null as string | null,
  password: null as string | null,
});
//***************************************************************** */

// Reactive state for form inputs
const formUser = reactive<UserForm>({
  first_name: "",
  last_name: "",
  email: "",
  role_ids: "",
  image: null as File | null,
  password: "",
  confirmPassword: "",
});
//***************************************************************** */

// Handle file selection
const handleFileSelect = (selectedFile: File) => {
  formUser.image = selectedFile;
  imageChanged.value = true;
  errors.value.file = null;
};

// Handle role selection
const handleRoleChange = (value: string) => {
  formUser.role_ids = value;
  errors.value.role_ids = null;
};
//***************************************************************** */

// Custom validation before submission
const validateForm = async () => {
  try {
    await formRef.value?.submitForm();

    // Only validate image if it was changed
    if (imageChanged.value && !formUser.image) {
      errors.value.file = "ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ";
      return false;
    }

    if (!formUser.role_ids) {
      errors.value.role_ids = "ກະລຸນາເລືອກບົດບາດຜູ້ໃຊ້";
      return false;
    }

    // Validate password if update is toggled
    if (updatePassword.value) {
      if (formUser.password !== formUser.confirmPassword) {
        errors.value.password = "ລະຫັດຜ່ານບໍ່ກົງກັນ";
        return false;
      }
      if (!formUser.password) {
        errors.value.password = "ກະລຸນາປ້ອນລະຫັດຜ່ານ";
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Validation failed:", error);
    return false;
  }
};
//***************************************************************** */

// Function to handle form submission
const submitData = async () => {
  // Validate form first
  const isValid = await validateForm();
  if (!isValid) return;

  try {
    // Show loading state
    isSubmitting.value = true;

    // Prepare data for API
    const userData: any = {
      firstName: formUser.first_name,
      lastName: formUser.last_name,
      email: formUser.email,
      roles: [parseInt(formUser.role_ids as string)], // Convert to array of numbers
    };

    // Only include image if it was changed
    if (imageChanged.value && formUser.image) {
      userData.image = formUser.image;
    }

    // Only include password if update is toggled
    if (updatePassword.value && formUser.password) {
      userData.password = formUser.password;
    }

    // Call API to update user
    const result = await userStore.updateUser(parseInt(userId.value), userData);

    if (result) {
      openNotification("success", "ອັບເດດຜູ້ໃຊ້", "ອັບເດດສຳເລັດ");

      router.push("/admin/users");
    }
  } catch (error) {
    console.error("ການອັບເດດຂໍ້ມູນຜິດພາດ:", error);
    message.error("ການອັບເດດຂໍ້ມູນຜິດພາດ");
  } finally {
    isSubmitting.value = false;
  }
};
//***************************************************************** */

// Prepare roles data for select component
const rolesOptions = computed(() => {
  if (!roleStore.roles.data || !Array.isArray(roleStore.roles.data)) {
    return [];
  }

  return roleStore.roles.data.map((role) => ({
    value: role.id.toString(),
    label: role.name,
  }));
});
//***************************************************************** */

// Load user data
const loadUserData = async () => {
  try {
    isLoading.value = true;

    // Load roles first
    await roleStore.getAllRoles();

    // Get user by ID
    const userData = await userStore.getUserById(parseInt(userId.value));

    if (userData) {
      // Handle nested profile data structure
      formUser.first_name =
        userData.profile?.first_name || userData.firstName || "";
      formUser.last_name =
        userData.profile?.last_name || userData.lastName || "";
      formUser.email = userData.email || "";

      // Set role_ids (assuming userData.roles is an array with at least one role)
      if (userData.roles && userData.roles.length > 0) {
        formUser.role_ids = userData.roles[0].id.toString();
      }

      // Set current image URL if available
      if (userData.profile?.image) {
        currentImageUrl.value = userData.profile.image;
      } else if (userData.imageUrl) {
        currentImageUrl.value = userData.imageUrl;
      }
    }
  } catch (error) {
    console.error("Failed to load user data:", error);
    message.error("ໂຫຼດຂໍ້ມູນຜູ້ໃຊ້ຜິດພາດ");
    // Navigate back to user list on error
    router.push("/users");
  } finally {
    isLoading.value = false;
  }
};
//***************************************************************** */

const getFullImageUrl = (imagePath: string) => {
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    // console.log("Image URL is already a full URL:", imagePath);
    return imagePath;
  }

  // ถ้าเป็น path แบบเริ่มต้นด้วย / จะทำการตัด / ออก
  const cleanPath = imagePath.startsWith("/")
    ? imagePath.substring(1)
    : imagePath;
  const fullUrl = `${import.meta.env.VITE_IMG_URL}/${cleanPath}`;
  // console.log("Original image path:", imagePath);
  // console.log("Full image URL created:", fullUrl);

  return fullUrl;
};

//***************************************************************** */

onMounted(() => {
  loadUserData();
});
</script>

<template>
  <LoadingSpinner v-if="isLoading" class="h-[80vh]" />

  <div v-else>
    <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white ">
      ອັບເດດຂໍ້ມູນຜູ້ໃຊ້
    </h2>

    <UiForm
      ref="formRef"
      :rules="rulesUser"
      :model="formUser"
      @finish="submitData"
    >
      <UiFormItem label="ຮູບພາບປັດຈຸບັນ / ອັບໂຫລດຮູບພາບໃໝ່" name="image">
        <div class="mb-4" v-if="currentImageUrl">
          <img
            :src="getFullImageUrl(currentImageUrl)"
            alt="User profile"
            class="w-32 h-32 object-cover rounded-lg border"
          />
        </div>
        <UploadFile @onFileSelect="handleFileSelect" />
        <div v-if="errors.file" class="text-red-500 text-sm mt-1">
          {{ errors.file }}
        </div>
      </UiFormItem>

      <div class="grid gap-4 mb-4 sm:mb-8 md:grid-cols-2 md:gap-6">
        <UiFormItem label="ຊື່" name="first_name">
          <UiInput
            v-model="formUser.first_name"
            placeholder="ຊື່"
            allowClear
            size="large"
          />
        </UiFormItem>

        <UiFormItem label="ນາມສະກຸນ" name="last_name">
          <UiInput
            v-model="formUser.last_name"
            placeholder="ນາມສະກຸນ"
            allowClear
            size="large"
          />
        </UiFormItem>

        <UiFormItem label="ອີເມວ" name="email">
          <UiInput
            v-model="formUser.email"
            placeholder="ອີເມວ"
            allowClear
            size="large"
          />
        </UiFormItem>

        <UiFormItem
          label="ບົດບາດຜູ້ໃຊ້"
          name="role_ids"
          :validateStatus="errors.role_ids ? 'error' : undefined"
        >
          <InputSelect
            v-model:value="formUser.role_ids"
            :options="rolesOptions"
            placeholder="ເລືອກບົດບາດ"
            size="large"
            @change="handleRoleChange"
          />
          <div v-if="errors.role_ids" class="text-red-500 text-sm mt-1">
            {{ errors.role_ids }}
          </div>
        </UiFormItem>
        <UiFormItem label="ລະຫັດຜ່ານໃໝ່" name="password">
          <UiInputPassword
            v-model="formUser.password"
            type="password"
            placeholder="ລະຫັດຜ່ານໃໝ່"
            allowClear
            size="large"
          />
        </UiFormItem>

        <UiFormItem label="ຢືນຢັນລະຫັດຜ່ານ" name="confirmPassword">
          <UiInputPassword
            v-model="formUser.confirmPassword"
            type="password"
            placeholder="ຢືນຢັນລະຫັດຜ່ານ"
            allowClear
            size="large"
          />
        </UiFormItem>
      </div>

      <!-- Password Update Section -->
      <div class="mb-6">
        <div v-if="errors.password" class="text-red-500 text-sm mt-1">
          {{ errors.password }}
        </div>
      </div>

      <button
        type="submit"
        class="px-5 py-2.5 text-white bg-primary-700 hover:bg-primary-900 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting">ກຳລັງອັບເດດ...</span>
        <span v-else>ອັບເດດຜູ້ໃຊ້</span>
      </button>
    </UiForm>
  </div>
</template>
