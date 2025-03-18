<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, computed } from "vue";

type OptionType = { label: string; value: string | number; group?: string };

// ปรับปรุง props ให้รองรับการจัดกลุ่ม
const props = defineProps<{
  options: OptionType[];
  groupBy?: string; // ชื่อ property ที่ใช้ในการจัดกลุ่ม
  modelValue?: (string | number)[];
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: (string | number)[]): void;
}>();

// ใช้ selectedValues เก็บค่าที่ถูกเลือก
const selectedValues = ref<(string | number)[]>(props.modelValue || []);

// คอยสังเกตค่า modelValue ที่เปลี่ยนแปลงจากภายนอก
watch(
  () => props.modelValue,
  (newValue) => {
    console.log("🔹 Model value changed:", newValue);
    selectedValues.value = newValue || [];
  }
);

// จัดกลุ่มตัวเลือก
const groupedOptions = computed(() => {
  if (!props.groupBy) return { "": props.options };

  const groups: Record<string, OptionType[]> = {};
  props.options.forEach((option) => {
    const groupName = option.group || "";
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(option);
  });
  return groups;
});

// ฟังก์ชันจัดการเลือก/ยกเลิกเลือก
const toggleOption = (value: string | number) => {
  const index = selectedValues.value.indexOf(value);
  if (index === -1) {
    // เพิ่มค่าใหม่
    selectedValues.value = [...selectedValues.value, value];
  } else {
    // ลบค่าที่เลือกออก
    selectedValues.value = selectedValues.value.filter((v) => v !== value);
  }
  emit("update:modelValue", selectedValues.value);
  console.log("🔹 Selected after toggle:", selectedValues.value);
};

// ตรวจสอบว่าค่าถูกเลือกหรือไม่
const isSelected = (value: string | number): boolean => {
  return selectedValues.value.includes(value);
};
</script>

<template>
  <!-- กรณีไม่ต้องการจัดกลุ่ม -->
  <div v-if="!props.groupBy">
    <a-checkbox-group
      :options="props.options"
      :value="selectedValues"
      @change="(values:any) => emit('update:modelValue', values)"
    />
  </div>

  <!-- กรณีต้องการจัดกลุ่ม -->
  <div v-else class="flex flex-wrap gap-3">
    <div
      v-for="(options, groupName) in groupedOptions"
      :key="groupName"
      class="w-44"
    >
      <h3
        v-if="groupName"
        class="block mb-2 text-sm font-medium dark:text-white"
      >
        {{ groupName }}
      </h3>
      <ul
        class="w-44 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <li
          v-for="option in options"
          :key="option.value"
          class="w-full px-2 py-1 border-b border-gray-200 dark:border-gray-600"
        >
          <a-checkbox
            :value="option.value"
            :checked="isSelected(option.value)"
            @change="() => toggleOption(option.value)"
          >
            {{ option.label }}
          </a-checkbox>
        </li>
      </ul>
    </div>
  </div>
</template>
