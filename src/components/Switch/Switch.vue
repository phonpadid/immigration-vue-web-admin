<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
}>();

const handleChange = (value: boolean) => {
  emit("update:modelValue", value);
};
</script>

<template>
  <div class="flex items-center gap-2">
    <a-switch :checked="modelValue" @change="handleChange" />
  </div>
</template>

<style scoped></style>
