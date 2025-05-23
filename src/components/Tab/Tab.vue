<template>
  <a-tabs v-model:activeKey="activeKey" class="custom-tabs">
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
<style>
/* Dark Mode styles for Tabs */
.dark .ant-tabs {
  color: #e5e7eb !important; /* gray.200 */
}

/* แท็บที่ไม่ได้เลือก */
.dark .ant-tabs-tab {
  color: #9ca3af !important; /* gray.400 */
  background-color: transparent !important;
  border-color: transparent !important;
}

/* แท็บที่ไม่ได้เลือก (hover) */
.dark .ant-tabs-tab:hover {
  color: #e5e7eb !important; /* gray.200 */
}

/* แท็บที่เลือก */
.dark .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
  color: #3b82f6 !important; /* blue.500 */
}

/* เส้นใต้แท็บที่เลือก */
.dark .ant-tabs-ink-bar {
  background-color: #3b82f6 !important; /* blue.500 */
}

/* เส้นแบ่งที่ใต้แท็บทั้งหมด */
.dark .ant-tabs-nav::before {
  border-bottom-color: #374151 !important; /* gray.700 */
}

/* ปุ่มลูกศร (ถ้ามีแท็บจำนวนมาก) */
.dark .ant-tabs-nav-operations {
  color: #9ca3af !important; /* gray.400 */
}

.dark .ant-tabs-nav-more {
  color: #9ca3af !important; /* gray.400 */
  background: #1f2937 !important; /* gray.800 */
  border-color: #374151 !important; /* gray.700 */
}

/* ปรับแต่ง dropdown menu ของแท็บ (กรณีมีแท็บจำนวนมาก) */
.dark .ant-tabs-dropdown {
  background-color: #1f2937 !important; /* gray.800 */
  border: 1px solid #374151 !important; /* gray.700 */
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.48),
    0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 9px 28px 8px rgba(0, 0, 0, 0.2) !important;
}

.dark .ant-tabs-dropdown-menu-item {
  color: #e5e7eb !important; /* gray.200 */
}

.dark .ant-tabs-dropdown-menu-item:hover {
  background-color: #374151 !important; /* gray.700 */
}

.dark .ant-tabs-dropdown-menu-item-active,
.dark .ant-tabs-dropdown-menu-item-selected {
  color: #3b82f6 !important; /* blue.500 */
  background-color: rgba(
    59,
    130,
    246,
    0.1
  ) !important; /* blue.500 with opacity */
}

/* พื้นที่เนื้อหาของแท็บ */
.dark .ant-tabs-content {
  color: #e5e7eb !important; /* gray.200 */
}

/* เพิ่ม specificity เพื่อให้แน่ใจว่า styles จะทำงานได้ */
html.dark .ant-tabs .ant-tabs-tab,
body.dark .ant-tabs .ant-tabs-tab {
  color: #9ca3af !important; /* gray.400 */
}

html.dark .ant-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn,
body.dark .ant-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
  color: #3b82f6 !important; /* blue.500 */
}
</style>
