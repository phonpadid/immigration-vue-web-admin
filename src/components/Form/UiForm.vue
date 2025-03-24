<script setup lang="ts">
import { defineProps, defineExpose, ref } from "vue";
import { type FormInstance } from "ant-design-vue";

const props = defineProps<{
  model: Record<string, any>; // ใช้เป็น v-model ของ Form
  rules?: Record<string, any>; // ใช้กำหนด validation rules
}>();

const formRef = ref<FormInstance>();

// ฟังก์ชัน Submit Form
// ฟังก์ชัน Submit Form
const submitForm = async () => {
  try {
    await formRef.value?.validate();
    return true; // คืนค่า true เมื่อ Validate สำเร็จ
  } catch (error) {
    return false; // คืนค่า false เมื่อ Validate ไม่ผ่าน
  }
};

// ให้ Parent Component เรียกใช้ submitForm()
defineExpose({ submitForm });
</script>

<template>
  <a-form ref="formRef" :model="model" :rules="rules" layout="vertical">
    <slot />
  </a-form>
</template>
