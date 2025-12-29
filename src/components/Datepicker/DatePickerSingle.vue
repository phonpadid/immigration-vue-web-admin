<template>
  <a-date-picker
    v-model:value="localDate"
    :placeholder="placeholder"
    style="width: 100%"
    :format="displayFormat"
    :valueFormat="valueFormat"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch, nextTick } from "vue";
import dayjs, { Dayjs } from "dayjs";

interface DatePickerSingleProps {
  value?: string | null;
  placeholder?: string;
  displayFormat?: string;
  valueFormat?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<DatePickerSingleProps>(), {
  value: null,
  placeholder: "ເລືອກວັນທີ",
  displayFormat: "YYYY-MM-DD",
  valueFormat: "YYYY-MM-DD",
  disabled: false,
});

const emit = defineEmits<{
  "update:value": [value: string | null];
}>();

// ใช้ flag เพื่อป้องกัน infinite loop
const isUpdatingFromProps = ref(false);

const localDate = ref<Dayjs | null>(
  props.value ? dayjs(props.value) : null
);

// Watch localDate changes (จาก user interaction)
watch(
  localDate,
  async (newDate) => {
    if (isUpdatingFromProps.value) return;

    if (newDate) {
      const formattedDate = newDate.format(props.valueFormat);
      emit("update:value", formattedDate);
    } else {
      emit("update:value", null);
    }
  }
);

// Watch props.value changes (จาก parent component)
watch(
  () => props.value,
  async (newValue) => {
    isUpdatingFromProps.value = true;

    if (newValue) {
      localDate.value = dayjs(newValue);
    } else {
      localDate.value = null;
    }

    await nextTick();
    isUpdatingFromProps.value = false;
  },
  { immediate: true }
);
</script>
