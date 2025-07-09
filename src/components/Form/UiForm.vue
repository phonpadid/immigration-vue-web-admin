<script setup lang="ts">
import { defineProps, defineExpose, ref, onMounted, nextTick } from "vue";
import { type FormInstance } from "ant-design-vue";

const props = defineProps<{
  model: Record<string, any>; // ใช้เป็น v-model ของ Form
  rules?: Record<string, any>; // ใช้กำหนด validation rules
}>();

const formRef = ref<FormInstance>();

// เพิ่ม method สำหรับ debug เพื่อดูสถานะของ form
const logFormState = () => {
  console.log("Current form state:", JSON.stringify(props.model));
  console.log("Form ref exists:", !!formRef.value);
};

// ฟังก์ชันที่จะแปลง Proxy Arrays เป็น normal arrays
const normalizeValues = (values: any) => {
  if (!values) return values;

  const normalized = { ...values };

  // แปลง Proxy arrays เป็น normal arrays
  Object.keys(normalized).forEach((key) => {
    if (Array.isArray(normalized[key])) {
      normalized[key] = [...normalized[key]]; // สร้าง array ใหม่
    }
  });

  return normalized;
};

// ปรับปรุงฟังก์ชัน validate
const validate = async (nameList?: string | string[]) => {
  if (!formRef.value) {
    console.error("Form reference not available");
    return false;
  }

  try {
    // ใช้ nextTick เพื่อให้แน่ใจว่า form state ได้รับการอัพเดทล่าสุด
    await nextTick();

    // ทำการ validate
    if (nameList) {
      const values = await formRef.value.validateFields(nameList);
      return normalizeValues(values);
    } else {
      const values = await formRef.value.validateFields();
      return normalizeValues(values);
    }
  } catch (errorInfo) {
    console.error("Validation failed:", errorInfo);
    return false;
  }
};

// แก้ไขฟังก์ชัน Submit Form
const submitForm = async (nameList?: string | string[]) => {
  if (!formRef.value) {
    console.error("Form reference not available");
    return false;
  }

  try {
    // รอให้ UI update ก่อนทำการ validate
    await nextTick();

    // Manual approach to force validation to be up-to-date
    formRef.value.scrollToField = () => {}; // Override to prevent scrolling

    let values;
    if (nameList) {
      values = await formRef.value.validateFields(nameList);
    } else {
      values = await formRef.value.validateFields();
    }

    // ตรวจสอบว่า values มีค่าหรือไม่ และไม่มี outOfDate
    if (values && !values.outOfDate) {
      console.log("Validation successful:", values);
      return normalizeValues(values);
    }

    // ถ้ามี outOfDate ให้ใช้ manual validation แทน
    if (values && values.outOfDate) {
      console.warn("Out of date validation, using form model instead");
      // ใช้ model ที่ pass เข้ามาโดยตรง แทนการใช้ validated values
      return normalizeValues({ ...props.model });
    }

    return values;
  } catch (errorInfo: any) {
    if (errorInfo?.outOfDate) {
      // console.warn("Caught out of date validation, using form model");
      return normalizeValues({ ...props.model });
    }
    console.error("Form validation failed:", errorInfo);
    return false;
  }
};

// เพิ่มฟังก์ชันสำหรับรีเซ็ตฟอร์ม
const resetFields = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  } else {
    console.error("Cannot reset fields: form reference not available");
  }
};

// ตรวจสอบว่า form ref ถูกสร้างขึ้นหรือไม่
onMounted(() => {
  if (!formRef.value) {
    console.warn("Form reference not available after mount");
  }
});

// ให้ Parent Component เรียกใช้ฟังก์ชันได้
defineExpose({
  submitForm,
  validate,
  resetFields,
  formRef,
  logFormState,
});
</script>

<template>
  <a-form ref="formRef" :model="model" :rules="rules" layout="vertical">
    <slot />
  </a-form>
</template>
