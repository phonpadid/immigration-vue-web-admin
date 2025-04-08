<template>
  <a-tabs v-model:activeKey="activeKey">
    <a-tab-pane v-for="tab in tabs" :key="tab.key" :tab="tab.label">
      <slot :name="tab.slotName"></slot>
    </a-tab-pane>
  </a-tabs>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from "vue";

interface Tab {
  key: string;
  label: string;
  slotName: string;
}

const props = defineProps({
  tabs: {
    type: Array as () => Tab[],
    required: true,
  },
  activeKey: {
    type: String,
    default: "1",
  },
});

const emit = defineEmits<{
  (e: "update:activeKey", key: string): void;
  (e: "change", key: string): void;
}>();

const activeKey = ref(props.activeKey);

watch(
  () => props.activeKey,
  (newValue) => {
    activeKey.value = newValue;
  }
);

watch(activeKey, (newValue) => {
  emit("update:activeKey", newValue);
  emit("change", newValue);
});
</script>
