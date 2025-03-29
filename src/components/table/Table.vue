<template>
  <a-table
    :columns="columns"
    :data-source="dataSource"
    :scroll="{ x: scrollX, y: scrollY }"
    :pagination="pagination"
    :rowClassName="rowClassName"
    :loading="loading"
    class="dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:thead-dark dark:tbody-dark"
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
import { defineProps, defineEmits } from "vue";

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
  };
  loading?: boolean;
  scrollX?: number;
  scrollY?: number;
  rowClassName?: string;
}>();

const emit = defineEmits(["update:pagination"]);

function handleTableChange(pagination: any) {
  emit("update:pagination", pagination);
}

function getNestedValue(record: Record, path: string | string[]): any {
  if (typeof path === "string") {
    path = path.split(".");
  }
  return path.reduce(
    (acc, key) => (acc && acc[key] !== undefined ? acc[key] : null),
    record
  );
}
</script>
