<template>
  <a-table
    :columns="columns"
    :data-source="dataSource"
    :scroll="{ x: true }"
    :pagination="paginationConfig"
    :rowClassName="rowClassName"
    :loading="loading"
    class="custom-table dark:bg-gray-800 dark:text-white dark:border-gray-700"
    @change="handleTableChange"
  >
    <template #bodyCell="{ column, record, index }">
      <slot :name="column.key" :index="index" :record="record" :column="column">
        {{ getNestedValue(record, column.dataIndex) }}
      </slot>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue";

interface Column {
  title: string;
  key: string;
  dataIndex?: string;
  width?: number;
}

interface Record {
  [key: string]: any;
}

const props = defineProps<{
  columns: Column[];
  dataSource: Record[];
  pagination?: {
    current?: number;
    total?: number;
    pageSize?: number;
    showSizeChanger?: boolean;
    pageSizeOptions?: string[];
    showTotal?: Function;
  };
  loading?: boolean;
  scrollX?: number;
  scrollY?: number;
  rowClassName?: string;
}>();

const emit = defineEmits<{
  (e: "change", pagination: any, filters: any, sorter: any): void;
}>();

// Configure pagination with defaults
const paginationConfig = computed(() => {
  return {
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["10", "20", "50", "100"],
    showTotal: (total: number) => `ທັງໝົດ ${total} ລາຍການ`,
    ...props.pagination,
  };
});

// Handle table changes including pagination
function handleTableChange(pagination: any, filters: any, sorter: any) {
  emit("change", pagination, filters, sorter);
}

function getNestedValue(record: Record, path: string | string[]): any {
  if (!path) return null;

  if (typeof path === "string") {
    path = path.split(".");
  }

  return path.reduce(
    (acc, key) => (acc && acc[key] !== undefined ? acc[key] : null),
    record
  );
}
</script>
<style>
/* Dark mode styling for Ant Design table */
.dark .custom-table {
  background-color: theme("colors.gray.800");
  color: theme("colors.white");
}

.dark .custom-table .ant-table {
  background-color: theme("colors.gray.800");
  color: theme("colors.white");
}

.dark .custom-table .ant-table-thead > tr > th {
  background-color: theme("colors.gray.900");
  color: theme("colors.white");
  border-bottom: 1px solid theme("colors.gray.700");
}

.dark .custom-table .ant-table-tbody > tr > td {
  border-bottom: 1px solid theme("colors.gray.700");
}

.dark .custom-table .ant-table-tbody > tr:hover > td {
  background-color: theme("colors.gray.700");
}

.dark .custom-table .ant-pagination-item {
  background-color: theme("colors.gray.800");
  border-color: theme("colors.gray.700");
}

.dark .custom-table .ant-pagination-item-active {
  background-color: theme("colors.blue.600");
  border-color: theme("colors.blue.600");
}

.dark .custom-table .ant-pagination-item-active a {
  color: theme("colors.white");
}

.dark .custom-table .ant-pagination-prev .ant-pagination-item-link,
.dark .custom-table .ant-pagination-next .ant-pagination-item-link,
.dark .custom-table .ant-pagination-jump-prev .ant-pagination-item-link,
.dark .custom-table .ant-pagination-jump-next .ant-pagination-item-link {
  background-color: theme("colors.gray.800");
  border-color: theme("colors.gray.700");
  color: theme("colors.white");
}

.dark .custom-table .ant-select-dropdown {
  background-color: theme("colors.gray.800");
  color: theme("colors.white");
  border-color: theme("colors.gray.700");
}

.dark .custom-table .ant-select-item {
  color: theme("colors.white");
}

.dark .custom-table .ant-select-item-option-selected,
.dark .custom-table .ant-select-item-option-active {
  background-color: theme("colors.gray.700");
}

.dark .custom-table .ant-pagination-options-size-changer.ant-select,
.dark .custom-table .ant-pagination-options-quick-jumper {
  color: theme("colors.white");
}

.dark .custom-table .ant-pagination-options-quick-jumper input {
  background-color: theme("colors.gray.700");
  border-color: theme("colors.gray.600");
  color: theme("colors.white");
}

.dark .custom-table .ant-empty-description {
  color: theme("colors.white");
}

.dark .custom-table .ant-table-placeholder {
  background-color: theme("colors.gray.800");
}
</style>
