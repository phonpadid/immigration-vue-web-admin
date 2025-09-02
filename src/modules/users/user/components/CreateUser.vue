<script setup lang="ts">
import { reactive, ref, watch, computed, onMounted } from "vue";
import type { UserForm } from "../interface/user.interface";
import { rulesUser } from "../validation/user.validation";
import { useUserStore } from "../store/user.store";
import { useRolesStore } from "../../role/store/role.store";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { useNotification } from "@/utils/notificationService";
import UploadFile from "@/components/Upload/UploadFile.vue";
import UiInput from "@/components/Input/UiInput.vue";
import UiInputPassword from "@/components/Input/UiInputPassword.vue";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import InputSelect from "@/components/Input/InputSelect.vue";

//***************************************************************** */
const { openNotification } = useNotification();

// Initialize user store
const userStore = useUserStore();
const roleStore = useRolesStore();
const router = useRouter();
const formRef = ref();
const isSubmitting = ref(false);
//***************************************************************** */

// Reactive state for form inputs
const formUser = reactive<UserForm>({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role_ids: "",
  image: null as File | null,
});
//***************************************************************** */
// Reactive state for errors
const errors = ref({
  file: null as string | null,
  confirmPassword: null as string | null,
  role_ids: null as string | null,
});
//***************************************************************** */

// Check if passwords match
const passwordsMatch = computed(() => {
  return (
    !formUser.confirmPassword || formUser.password === formUser.confirmPassword
  );
});
//***************************************************************** */

// Watch for confirm password changes
watch(
  () => formUser.confirmPassword,
  (newValue) => {
    if (newValue && formUser.password !== newValue) {
      errors.value.confirmPassword = "ລະຫັດຢືນຢັນບໍ່ກົງກັນ";
    } else {
      errors.value.confirmPassword = null;
    }
  }
);
//***************************************************************** */

// Watch for password changes (to validate confirm password again)
watch(
  () => formUser.password,
  () => {
    if (formUser.confirmPassword) {
      if (formUser.password !== formUser.confirmPassword) {
        errors.value.confirmPassword = "ລະຫັດຢືນຢັນບໍ່ກົງກັນ";
      } else {
        errors.value.confirmPassword = null;
      }
    }
  }
);
//***************************************************************** */

// Handle file selection
const handleFileSelect = (selectedFile: File) => {
  formUser.image = selectedFile;
  // console.log("Selected file:", selectedFile.name);

  // Clear file error when a file is selected
  errors.value.file = null;
};
//***************************************************************** */

// Handle role selection
const handleRoleChange = (value: string) => {
  formUser.role_ids = value;
  // console.log("Selected role:", value);
  // Clear role error when a role is selected
  errors.value.role_ids = null;
};
//***************************************************************** */

// Custom validation before submission
const validateForm = async () => {
  try {
    // Run the form validation from the form component
    await formRef.value?.submitForm();

    // Additional manual validations
    let isValid = true;

    // Validate file upload
    if (!formUser.image) {
      errors.value.file = "ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ";
      isValid = false;
    }

    // Validate password confirmation
    if (formUser.password !== formUser.confirmPassword) {
      errors.value.confirmPassword = "ລະຫັດຢືນຢັນບໍ່ກົງກັນ";
      isValid = false;
    }

    // Validate role selection
    if (!formUser.role_ids) {
      errors.value.role_ids = "ກະລຸນາເລືອກບົດບາດຜູ້ໃຊ້";
      isValid = false;
    }

    return isValid;
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
  if (!isValid) {
    console.log("Form validation failed");
    return;
  }

  try {
    // Show loading state
    isSubmitting.value = true;

    // Prepare data for API
    const userData = {
      firstName: formUser.first_name,
      lastName: formUser.last_name,
      email: formUser.email,
      password: formUser.password,
      roles: [parseInt(formUser.role_ids as string)], // Convert to array of numbers
      image: formUser.image as File,
    };

    console.log("Submitting user data:", {
      ...userData,
      password: "***", // Hide password in logs
      image: userData.image?.name || null,
    });

    // Call API to create user
    const result = await userStore.createUser(userData);

    if (result) {
      // Show success message
      openNotification("success", "ບັນທຶກຂໍ້ມູນຜູ້ໃຊ້", "ບັນທຶກສຳເລັດ");
      formUser.image = null;
      errors.value = { file: null, confirmPassword: null, role_ids: null };
      router.push({ name: "users" });
    } else {
      // Handle the case when API returns falsy result
      message.error("ບັນທຶກຂໍ້ມູນຜິດພາດ: ບໍ່ສາມາດເພີ່ມຜູ້ໃຊ້ໄດ້");
    }
  } catch (error) {
    console.error("ການບັນທຶກຂໍ້ມູນຜິດພາດ:", error);
    message.error("ການບັນທຶກຂໍ້ມູນຜິດພາດ");
  } finally {
    isSubmitting.value = false;
  }
};
//***************************************************************** */

// Watch for image changes
watch(
  () => formUser.image,
  (newValue) => {
    if (newValue) {
      errors.value.file = null;
    }
  }
);
//***************************************************************** */

// Prepare roles data for select component
const rolesOptions = computed(() => {
  if (!roleStore.roles.data || !Array.isArray(roleStore.roles.data)) {
    console.warn("Role data is not available or not an array");
    return [];
  }

  // Log first role for debugging
  if (roleStore.roles.data.length > 0) {
    console.log("First role object:", roleStore.roles.data[0]);
  }

  return roleStore.roles.data.map((role) => {
    // Make sure to use the correct property names from your role object
    return {
      value: role.id.toString(),
      label: role.name || "Unknown Role", // Fallback if name is missing
    };
  });
});
//***************************************************************** */

// Fetch roles data
const getRoleUser = async () => {
  try {
    // console.log("Fetching roles data...");
    await roleStore.getAllRoles();
    // console.log("Roles data fetched successfully");
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    message.error("ບໍ່ສາມາດດຶງຂໍ້ມູນບົດບາດຜູ້ໃຊ້ໄດ້");
  }
};
//***************************************************************** */

// Component lifecycle hook
onMounted(async () => {
  await getRoleUser();
});
</script>

<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white ">
    ເພີ່ມຜູ້ໃຊ້ໃໝ່
  </h2>
  <UiForm
    ref="formRef"
    :rules="rulesUser"
    :model="formUser"
    @finish="submitData"
  >
    <UiFormItem label="ອັບໂຫລດໄຟລ໌" name="image">
      <UploadFile @onFileSelect="handleFileSelect" />
      <div v-if="errors.file" class="text-red-500 text-sm mt-1">
        {{ errors.file }}
      </div>
      <div v-if="formUser.image" class="text-green-600 text-sm mt-1">
        ເລືອກໄຟລ໌: {{ formUser.image.name }}
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
      <UiFormItem label="ລະຫັດຜ່ານ" name="password">
        <UiInputPassword
          v-model="formUser.password"
          placeholder="ປ້ອນລະຫັດຜ່ານ"
          size="large"
        />
      </UiFormItem>
      <UiFormItem
        label="ຢືນຢັນລະຫັດ"
        name="confirmPassword"
        :validateStatus="errors.confirmPassword ? 'error' : undefined"
      >
        <UiInputPassword
          v-model="formUser.confirmPassword"
          placeholder="ປ້ອນລະຫັດຜ່ານ"
          size="large"
        />
        <div v-if="errors.confirmPassword" class="text-red-500 text-sm mt-1">
          {{ errors.confirmPassword }}
        </div>
      </UiFormItem>
    </div>
    <button
      type="submit"
      class="px-5 py-2.5 text-white bg-primary-700 hover:bg-primary-900 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm"
      :disabled="isSubmitting || !passwordsMatch"
    >
      <span v-if="isSubmitting">ກຳລັງບັນທຶກ...</span>
      <span v-else>ເພີ່ມຜູ້ໃຊ້</span>
    </button>
  </UiForm>
</template>
