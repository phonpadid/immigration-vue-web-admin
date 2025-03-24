<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { LawForm } from "../interface/laws.interface";
import { useLawStore } from "../store/laws.store";
import { useNotification } from "@/utils/notificationService";
import { rulesLaws } from "../validation/law.validation";
import UploadFIlePDF from "@/components/Upload/UploadFIlePDF.vue";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiInput from "@/components/Input/UiInput.vue";
import UiButton from "@/components/button/UiButton.vue";

/********************************************************************* */
const { openNotification } = useNotification();
const route = useRoute();
const router = useRouter();
const lawId = Number(route.params.id);
const lawStore = useLawStore();
const isSubmitting = ref(false);
const isLoading = ref(true);
const formRef = ref();
/********************************************************************* */

// Initialize the form data
const formLaws = reactive<LawForm>({
  name: "",
  file: null as File | string | null,
});

/********************************************************************* */

// Handle form submission for update
const handleUpdate = async () => {
  try {
    const valid = await formRef.value?.submitForm();
    if (!valid) return;

    // Set loading state
    isSubmitting.value = true;

    // สร้าง object สำหรับส่งไปอัปเดต
    const updateData: Partial<{
      name: string;
      file: File | undefined;
    }> = {
      name: formLaws.name,
    };

    // ถ้ามีการเลือกไฟล์ใหม่ (เป็น File object) ให้ส่งไปด้วย
    if (formLaws.file && formLaws.file instanceof File) {
      updateData.file = formLaws.file;
    }
    await lawStore.updateLaws(lawId, updateData);
    openNotification("success", "ອັບເດດຂໍ້ມູນກົດໝາຍ", "ອັບເດດສຳເລັດ");
    router.push("/laws");
  } catch (error) {
    console.error("Error updating law:", error);
    openNotification("error", "ເກີດຂໍ້ຜິດພາດ", "ກະລຸນາກວດສອບຂໍ້ມູນຄືນ");
  } finally {
    isSubmitting.value = false;
  }
};

// กลับไปหน้ารายการกฎหมาย
const handleRemoveLaws = () => {
  router.push("/laws");
};
/***************************************************************** */
onMounted(async () => {
  try {
    isLoading.value = true;
    if (lawId) {
      const lawData = await lawStore.getLawById(lawId);
      if (lawData) {
        formLaws.name = lawData.name || "";
        formLaws.file = lawData.file_url || null;
      }
    }
  } catch (error) {
    console.error("Error fetching law data:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div v-if="isLoading" class="flex justify-center items-center h-64">
    <div
      class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-700"
    ></div>
  </div>

  <UiForm v-else ref="formRef" :model="formLaws" :rules="rulesLaws">
    <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white mt-12">
      ອັບເດດ
    </h2>

    <UiFormItem label="ອັບໂຫລດໄຟລ໌" name="file">
      <div
        v-if="typeof formLaws.file === 'string' && formLaws.file"
        class="mb-2 text-sm text-gray-600"
      >
        ໄຟລ໌ປະຈຸບັນ: {{ formLaws.file.split("/").pop() }}
      </div>
      <UploadFIlePDF v-model="formLaws.file" />
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

    <div class="flex gap-4">
      <UiButton
        @click="handleUpdate"
        type="submit"
        size="large"
        :loading="isSubmitting || lawStore.isLoading"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
      >
        {{
          isSubmitting || lawStore.isLoading ? "ກຳລັງບັນທຶກ..." : "ອັບເດດກົດໝາຍ"
        }}
      </UiButton>

      <UiButton
        @click="handleRemoveLaws"
        type="button"
        size="large"
        icon="material-symbols:delete-outline-sharp"
        colorClass="!bg-red-500 hover:!bg-red-700 text-white flex items-center"
      >
        ລຶບ
      </UiButton>
    </div>
  </UiForm>
</template>
