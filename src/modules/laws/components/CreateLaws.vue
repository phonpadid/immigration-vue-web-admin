<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import type { LawForm } from "../interface/laws.interface";
import { useLawStore } from "../store/laws.store";
import { rulesLaws } from "../validation/law.validation";
import { useNotification } from "@/utils/notificationService";
import { useRouter } from "vue-router";
import { LAW_WRITE } from "@/common/utils/PermissionGroup";
import { useAuthStore } from "@/lib/stores/auth.store";
import HasPermission from "@/components/CheckPermission/HasPermission.vue";
import UploadFIlePDF from "@/components/Upload/UploadFIlePDF.vue";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiInput from "@/components/Input/UiInput.vue";
import UiButton from "@/components/button/UiButton.vue";

/**************************************************************** */
const formLaws = reactive<LawForm>({
  name: "",
  file: null as File | null,
});
/**************************************************************** */

const { openNotification } = useNotification();
const { push } = useRouter();
const formRef = ref();
const lawStore = useLawStore();
const isSubmitting = ref(false);
const authStore = useAuthStore();
const canWriteLaws = computed(() => authStore.hasPermission(LAW_WRITE));
/**************************************************************** */

const handleSubmit = async () => {
  if (!canWriteLaws.value) {
    openNotification("error", "ຂໍ້ຜິດພາດ", "ທ່ານບໍ່ມີສິດເພີ່ມຂໍ້ມູນໂຮງແຮມ");
    return;
  }
  try {
    const valid = await formRef.value?.submitForm();
    if (!valid) return;
    // Set loading state
    isSubmitting.value = true;

    // Submit the form using the store
    await lawStore.createLaws({
      name: formLaws.name,
      file: formLaws.file,
    });

    // Show success message
    openNotification("success", "ບັນທຶກຂໍ້ມູນກົດໝາຍ", "ບັນທຶກສຳເລັດ");
    push({ name: "laws" });
    // Reset form
    formLaws.name = "";
    formLaws.file = null;
  } catch (error) {
    console.error("Error submitting form:", error);
  } finally {
    isSubmitting.value = false;
  }
};
/**************************************************************** */
const goBack = () => {
  push({ name: "laws" });
};
/**************************************************************** */

watch(
  () => formLaws.file,
  () => {
    formRef.value?.submitForm(["file"]);
  }
);
</script>

<template>
  <HasPermission :permission="LAW_WRITE">
    <UiForm ref="formRef" :model="formLaws" :rules="rulesLaws">
      <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white mt-12">
        ເພີ່ມຂໍ້ມູນ
      </h2>
      <UiFormItem label="ອັບໂຫລດໄຟລ໌" name="file">
        <UploadFIlePDF v-model="formLaws.file" />
        <span class="text-gray-500 dark:text-white">Upload file pdf</span>
      </UiFormItem>

      <div class="grid gap-4 mb-4 sm:mb-8 md:grid-cols-2 md:gap-6">
        <UiFormItem label="ຊື່" name="name">
          <UiInput
            v-model="formLaws.name"
            placeholder="ຊື່"
            allowClear
            size="large"
          />
        </UiFormItem>
      </div>

      <UiButton
        @click="handleSubmit"
        type="submit"
        size="large"
        :loading="isSubmitting || lawStore.isLoading"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
      >
        {{
          isSubmitting || lawStore.isLoading ? "ກຳລັງບັນທຶກ..." : "ເພີ່ມຂໍ້ມູນ"
        }}
      </UiButton>
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
    </UiForm>
  </HasPermission>
</template>
