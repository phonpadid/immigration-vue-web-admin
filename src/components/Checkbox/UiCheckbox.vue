<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue";

interface Option {
  label: string;
  value: string | number;
}

const props = defineProps<{
  modelValue: (string | number)[];
  options: Option[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: (string | number)[]): void;
}>();

const selectedValues = computed({
  get: () => props.modelValue,
  set: (value: (string | number)[]) => {
    emit("update:modelValue", value);
  },
});
</script>

<template>
  <a-checkbox-group
    v-model:value="selectedValues"
    :options="props.options"
    :disabled="props.disabled"
  />
</template>
