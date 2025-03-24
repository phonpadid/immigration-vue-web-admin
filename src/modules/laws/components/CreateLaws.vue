<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import type { LawForm } from "../interface/laws.interface";
import { useLawStore } from "../store/laws.store";
import { rulesLaws } from "../validation/law.validation";
import { useNotification } from "@/utils/notificationService";
import { useRouter } from "vue-router";
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
/**************************************************************** */

const handleSubmit = async () => {
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

watch(
  () => formLaws.file,
  () => {
    formRef.value?.submitForm(["file"]);
  }
);
</script>

<template>
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
  </UiForm>
</template>
