<template>
  <a-collapse v-model:activeKey="activeKeys">
    <a-collapse-panel
      v-for="(panel, index) in panels"
      :key="panel.key"
      :header="panel.header"
    >
      <div class="panel-content">
        <div class="content-area">
          <slot :name="`content-${panel.key}`" :panel="panel">
            <template v-if="panel.type === 'form'">
              <slot :name="`form-${panel.key}`" :panel="panel">
                <div class="default-form">
                  {{ panel.content }}
                </div>
              </slot>
            </template>

            <template v-else-if="panel.type === 'table'">
              <slot :name="`table-${panel.key}`" :panel="panel">
                <a-table
                  v-if="panel.tableData"
                  :columns="panel.tableColumns"
                  :data-source="panel.tableData"
                  :pagination="panel.tablePagination"
                />
              </slot>
            </template>

            <template v-else-if="panel.type === 'image'">
              <div class="image-container">
                <img :src="panel.imageUrl" :alt="panel.imageAlt || ''" />
              </div>
            </template>

            <template v-else>
              <div class="default-content">
                {{ panel.content }}
              </div>
            </template>
          </slot>
        </div>

        <div class="action-buttons">
          <slot :name="`actions-${panel.key}`" :panel="panel">
            <a-space>
              <a-tooltip title="ແກ້ໄຂ">
                <a-button
                  type="text"
                  class="action-button"
                  @click="handleEdit(panel)"
                >
                  <template #icon
                    ><Icon icon="mdi:edit" class="text-primary-600 text-2xl"
                  /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="ລຶບ">
                <a-button
                  type="text"
                  class="action-button delete"
                  @click="handleDelete(panel)"
                >
                  <template #icon
                    ><Icon
                      icon="material-symbols:delete-outline-sharp"
                      class="text-red-600 text-2xl"
                  /></template>
                </a-button>
              </a-tooltip>
              <slot name="extra-actions" :panel="panel"></slot>
            </a-space>
          </slot>
        </div>
      </div>
    </a-collapse-panel>
  </a-collapse>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import { Icon } from "@iconify/vue";

interface TableColumn {
  title: string;
  dataIndex: string;
  key: string;
  [key: string]: any;
}

interface Panel {
  key: string | number;
  header: string;
  content?: string;
  type?: "default" | "form" | "table" | "image";
  imageUrl?: string;
  imageAlt?: string;
  tableData?: any[];
  tableColumns?: TableColumn[];
  tablePagination?: boolean | object;
  images?: any[];
  [key: string]: any;
}

interface Props {
  panels: Panel[];
  bordered?: boolean;
  activeKey?: string[];
  defaultActiveKeys?: (string | number)[];
}

const props = withDefaults(defineProps<Props>(), {
  bordered: true,
  activeKey: () => [],
  defaultActiveKeys: () => [],
});

const emit = defineEmits<{
  (e: "update:activeKey", keys: string[]): void;
  (e: "change", keys: string[]): void;
  (e: "edit", panel: Panel): void;
  (e: "delete", panel: Panel): void;
}>();

const activeKeys = ref<string[]>(props.activeKey);

watch(
  () => props.activeKey,
  (newValue) => {
    activeKeys.value = newValue;
  }
);

watch(activeKeys, (newValue) => {
  emit("update:activeKey", newValue);
  emit("change", newValue);
});

const handleEdit = (panel: Panel) => {
  emit("edit", panel);
};

const handleDelete = (panel: Panel) => {
  emit("delete", panel);
};
</script>
<style scoped>
.panel-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.content-area {
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 4px 8px;
}

.action-button:hover {
  background-color: #f0f0f0;
  border-radius: 4px;
}

.action-button.delete:hover {
  color: #ff4d4f;
}

.image-container img {
  max-width: 100%;
  height: auto;
}

.default-form {
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
}

.default-content {
  padding: 8px 0;
}
</style>
