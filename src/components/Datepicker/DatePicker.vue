<template>
  <a-range-picker
    v-model:value="localDateRange"
    :placeholder="[startPlaceholder, endPlaceholder]"
    style="width: 100%"
    :format="displayFormat"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch, nextTick } from "vue";
import dayjs, { Dayjs } from "dayjs";

interface DateRangeProps {
  value?: [string, string] | null;
  startPlaceholder?: string;
  endPlaceholder?: string;
  displayFormat?: string;
  valueFormat?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<DateRangeProps>(), {
  value: null,
  startPlaceholder: "ເວລາເລີ່ມຕົ້ນ(ວ/ດ/ປ)",
  endPlaceholder: "ເວລາສິ້ນສຸດ(ວ/ດ/ປ)",
  displayFormat: "DD/MM/YYYY",
  valueFormat: "YYYY-MM-DD",
  disabled: false,
});

const emit = defineEmits<{
  "update:value": [value: [string, string] | null];
}>();

// ใช้ flag เพื่อป้องกัน infinite loop
const isUpdatingFromProps = ref(false);

const localDateRange = ref<[Dayjs, Dayjs] | null>(
  props.value && props.value.length === 2
    ? [dayjs(props.value[0]), dayjs(props.value[1])]
    : null
);

// Watch localDateRange changes (จาก user interaction)
watch(
  localDateRange,
  async (newDates) => {
    if (isUpdatingFromProps.value) return;
    
    if (newDates && newDates.length === 2) {
      const formattedDates: [string, string] = [
        newDates[0].format(props.valueFormat),
        newDates[1].format(props.valueFormat),
      ];
      emit("update:value", formattedDates);
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
    
    if (newValue && newValue.length === 2) {
      localDateRange.value = [dayjs(newValue[0]), dayjs(newValue[1])];
    } else {
      localDateRange.value = null;
    }
    
    await nextTick();
    isUpdatingFromProps.value = false;
  },
  { immediate: true }
);
</script>