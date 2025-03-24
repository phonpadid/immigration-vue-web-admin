<template>
  <a-tabs v-model:activeKey="activeKey">
    <a-tab-pane v-for="tab in tabs" :key="tab.key" :tab="tab.label">
      <slot :name="tab.slotName"></slot>
    </a-tab-pane>
  </a-tabs>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from "vue";

const props = defineProps({
  tabs: {
    type: Array as () => { key: string; label: string; slotName: string }[],
    required: true,
  },
  modelValue: {
    type: String,
    default: "1",
  },
});

const activeKey = ref(props.modelValue);
const emit = defineEmits(["update:modelValue"]);

watch(activeKey, (newValue) => {
  emit("update:modelValue", newValue);
});
</script>
