<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useNewscategoriesStore } from "../store/new.categories.store";
import { useNotification } from "@/utils/notificationService";
import {
  rulesNewsCategories,
  validateNewsCategoriesData,
} from "../validation/new.categories.validation";
import UiForm from "@/components/Form/UiForm.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiInput from "@/components/Input/UiInput.vue";
import Tab from "@/components/Tab/Tab.vue";
import UiButton from "@/components/button/UiButton.vue";

/********************************************************************************* */
// กำหนดชนิดข้อมูลสำหรับภาษาที่รองรับ
type LanguageKeys = "lo" | "en" | "zh_cn";

// เรียกใช้ store สำหรับจัดการข้อมูลประเภทข่าว
const newsCategoriesStore = useNewscategoriesStore();

// เรียกใช้ router สำหรับนำทางไปยังหน้าอื่น
const { push } = useRouter();

// เรียกใช้บริการการแจ้งเตือน
const { openNotification } = useNotification();

// สถานะการโหลดข้อมูล
const isLoading = ref(false);

// แท็บที่เปิดใช้งานอยู่
const activeTab = ref("1");

// อ้างอิงถึง form component
const formRef = ref();

// กำหนดค่าการตั้งค่าแท็บ
const tabsConfig = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1" }, // ภาษาลาว
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2" }, // ภาษาอังกฤษ
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3" }, // ภาษาจีน
];

// สำหรับใช้ภายใน - เก็บค่า slug ที่สร้างขึ้น
const slugs = reactive({
  lo: "",
  en: "",
  zh_cn: "",
});

/********************************************************************************* */
const formData = reactive<Record<LanguageKeys, { name: string }>>({
  lo: { name: "" },
  en: { name: "" },
  zh_cn: { name: "" },
});

/********************************************************************************* */

// สร้าง slug จากชื่อ
const generateSlug = (name: string): string => {
  return name
    .toLowerCase() // แปลงเป็นตัวพิมพ์เล็ก
    .replace(/\s+/g, "-") // แทนที่ช่องว่างด้วยเครื่องหมายขีด
    .replace(/[^\w\-]+/g, ""); // ลบอักขระที่ไม่ใช่ตัวอักษร ตัวเลข หรือขีด
};

/********************************************************************************* */

// อัปเดตชื่อและสร้าง slug โดยอัตโนมัติ
const updateName = (lang: LanguageKeys, value: string | number) => {
  formData[lang].name = String(value);
  slugs[lang] = generateSlug(String(value));
};

/********************************************************************************* */

// ตรวจสอบความถูกต้องของข้อมูลทั้งหมดก่อนบันทึก
const validateAllData = async () => {
  const result = await validateNewsCategoriesData(formData);
  if (!result.isValid && result.errors) {
    const firstError = Object.values(result.errors)[0];
    openNotification("error", "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ", firstError);
    return false;
  }
  return true;
};

// การส่งข้อมูลฟอร์ม
const handleSubmit = async () => {
  try {
    // ตรวจสอบความถูกต้องของข้อมูลด้วย UiForm
    const valid = await formRef.value?.submitForm();
    if (!valid) return;

    // ตรวจสอบความถูกต้องของข้อมูลทั้งหมดอีกครั้ง (เป็นการตรวจสอบเพิ่มเติม)
    const isDataValid = await validateAllData();
    if (!isDataValid) return;

    // เริ่มการโหลด
    isLoading.value = true;

    // บันทึกข้อมูลผ่าน store
    await newsCategoriesStore.createNewsCategories(formData);

    // แสดงการแจ้งเตือนเมื่อสำเร็จ
    openNotification("success", "ເພີ່ມປະເພດຂ່າວ", "ເພີ່ມສຳເລັດ");

    // นำทางกลับไปยังหน้ารายการประเภทข่าว
    push({ name: "newsCategoriess" });
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
    ເພີ່ມຂ່າວສານ
  </h2>
  <div>
    <UiForm ref="formRef" :model="formData" :rules="rulesNewsCategories">
      <Tab v-model="activeTab" :tabs="tabsConfig">
        <!-- ພາສາລາວ (Lao) -->
        <template #tab1>
          <UiFormItem label="ຊື່ຂ່າວສານ " name="lo_name">
            <UiInput
              v-model="formData.lo.name"
              @update:modelValue="(val) => updateName('lo', val)"
              placeholder="ປ້ອນຊື່ຂອງຂ່າວສານ"
              allowClear
              size="large"
            />
          </UiFormItem>
        </template>

        <!-- ພາສາອັງກິດ (English) -->
        <template #tab2>
          <UiFormItem label="ຊື່ຂ່າວສານ " name="en_name">
            <UiInput
              v-model="formData.en.name"
              @update:modelValue="(val) => updateName('en', val)"
              placeholder="ປ່ອນຊື່ຂອງຂ່າວສານ"
              allowClear
              size="large"
            />
          </UiFormItem>
        </template>

        <!-- ພາສາຈີນ (Chinese) -->
        <template #tab3>
          <UiFormItem label="ຊື່ຂ່າວສານ " name="zh_cn_name">
            <UiInput
              v-model="formData.zh_cn.name"
              @update:modelValue="(val) => updateName('zh_cn', val)"
              placeholder="ປ້ອນຊື່ຂອງຂ່າວສານ"
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
        ເພີ່ມຂ່າວສານ
      </UiButton>
    </UiForm>
  </div>
</template>
