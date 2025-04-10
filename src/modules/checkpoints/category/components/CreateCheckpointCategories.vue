<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useCheckpointcategoriesStore } from "../store/checkpoint.categories.store";
import { useNotification } from "@/utils/notificationService";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiInput from "@/components/Input/UiInput.vue";
import Tab from "@/components/Tab/Tab.vue";
import UiButton from "@/components/button/UiButton.vue";
import Textarea from "@/components/Input/Textarea.vue";

/********************************************************************************* */
type LanguageKeys = "lo" | "en" | "zh_cn";

const { createCheckpointCategories } = useCheckpointcategoriesStore();

const { push } = useRouter();

const { openNotification } = useNotification();

const isLoading = ref(false);

const activeTab = ref("1");

const formRef = ref();

const tabsConfig = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3" },
];

const slugs = reactive({
  lo: "",
  en: "",
  zh_cn: "",
});

/********************************************************************************* */
const formData = reactive<
  Record<LanguageKeys, { title: string; description: string }>
>({
  lo: { title: "", description: "" },
  en: { title: "", description: "" },
  zh_cn: { title: "", description: "" },
});

/********************************************************************************* */

// สร้าง slug จากชื่อ
const generateSlug = (title: string): string => {
  return title
    .toLowerCase() // แปลงเป็นตัวพิมพ์เล็ก
    .replace(/\s+/g, "-") // แทนที่ช่องว่างด้วยเครื่องหมายขีด
    .replace(/[^\w\-]+/g, ""); // ลบอักขระที่ไม่ใช่ตัวอักษร ตัวเลข หรือขีด
};

/********************************************************************************* */

const updateName = (lang: LanguageKeys, value: string | number) => {
  formData[lang].title = String(value); 
  slugs[lang] = generateSlug(String(value)); // Convert value to string before generating slug
};

/********************************************************************************* */

// การส่งข้อมูลฟอร์ม
const handleSubmit = async () => {
  try {
    // ตรวจสอบความถูกต้องของข้อมูลด้วย UiForm
    const valid = await formRef.value?.submitForm();
    if (!valid) return;

    // เริ่มการโหลด
    isLoading.value = true;

    // บันทึกข้อมูลผ่าน store
    await createCheckpointCategories(formData);

    // แสดงการแจ้งเตือนเมื่อสำเร็จ
    openNotification("success", "ເພີ່ມປະເພດດ່ານ", "ເພີ່ມສຳເລັດ");

    // นำทางกลับไปยังหน้ารายการประเภทข่าว
    push({ name: "checkpointCategories" });
  } catch (error) {
    // บันทึกข้อผิดพลาดและแสดงการแจ้งเตือน
    console.error("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ:", error);
    openNotification(
      "error",
      "ເກີດຂໍ້ຜິດພາດ",
      "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ ກະລຸນາລອງອີກຄັ້ງ"
    );
  } finally {
    // สิ้นสุดการโหลด
    isLoading.value = false;
  }
};
/********************************************************************************* */
</script>

<template>
  <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white mt-12">
    ເພີ່ມປະເພດດ່ານ
  </h2>
  <div>
    <UiForm ref="formRef" :model="formData">
      <Tab v-model="activeTab" :tabs="tabsConfig">
        <!-- ພາສາລາວ (Lao) -->
        <template #tab1>
          <UiFormItem label="ຊື່ປະເພດດ່ານ" name="lo_name">
            <UiInput
              v-model="formData.lo.title"
              @update:modelValue="(val) => updateName('lo', val)"
              placeholder="ປ້ອນຊື່ປະເພດດ່ານ"
              allowClear
              size="large"
            />
          </UiFormItem>
          <UiFormItem label="ຄຳອະທິບາຍປະເພດດ່ານ" name="description">
            <Textarea
              v-model="formData.lo.description"
              placeholder="ປ້ອນຄຳອະທິບາຍປະເພດດ່ານ"
              allowClear
              size="large"
            />
          </UiFormItem>
        </template>

        <!-- ພາສາອັງກິດ (English) -->
        <template #tab2>
          <UiFormItem label="ຊື່ປະເພດດ່ານ " name="en_name">
            <UiInput
              v-model="formData.en.title"
              @update:modelValue="(val) => updateName('en', val)"
              placeholder="ປ້ອນຊື່ປະເພດດ່ານ"
              allowClear
              size="large"
            />
          </UiFormItem>
          <UiFormItem label="ຄຳອະທິບາຍປະເພດດ່ານ" name="description">
            <Textarea
              v-model="formData.en.description"
              placeholder="ປ້ອນຄຳອະທິບາຍປະເພດດ່ານ"
              allowClear
              size="large"
            />
          </UiFormItem>
        </template>

        <!-- ພາສາຈີນ (Chinese) -->
        <template #tab3>
          <UiFormItem label="ຊື່ປະເພດດ່ານ " name="zh_cn_name">
            <UiInput
              v-model="formData.zh_cn.title"
              @update:modelValue="(val) => updateName('zh_cn', val)"
              placeholder="ປ່ອນຊື່ປະເພດດ່ານ"
              allowClear
              size="large"
            />
          </UiFormItem>
          <UiFormItem label="ຄຳອະທິບາຍປະເພດດ່ານ" name="description">
            <Textarea
              v-model="formData.zh_cn.description"
              placeholder="ປ້ອນຄຳອະທິບາຍປະເພດດ່ານ"
              allowClear
              size="large"
            />
          </UiFormItem>
        </template>
      </Tab>
      <UiButton
        @click="handleSubmit"
        type="submit"
        size="large"
        :loading="isLoading"
        colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
      >
        ເພີ່ມປະເພດດ່ານ
      </UiButton>
    </UiForm>
  </div>
</template>
