<!-- <template>
  <div class="action-group">
    <div
      v-if="showVerify"
      @click="verifyItem(record)"
      class="relative flex items-center justify-center ml-2 text-gray-500/80 cursor-pointer"
    >
      <Icon class="text-2xl" :icon="verifyIcon" />
    </div>
    <div
      v-if="showView"
      @click="viewItem(record)"
      class="relative flex items-center justify-center text-green-500/80 cursor-pointer"
    >
      <Icon class="text-2xl" :icon="viewIcon" />
    </div>
    <div
      v-if="showDownload"
      @click="downloadItem(record)"
      class="relative flex items-center justify-center text-green-500/80 cursor-pointer"
    >
      <Icon class="text-2xl" :icon="downloadIcon" />
    </div>
    <div
      v-if="showAdd"
      @click="addItem(record)"
      class="relative flex items-center justify-center text-green-500/80 cursor-pointer"
    >
      <Icon class="text-2xl" :icon="addIcon" />
    </div>
    <div
      v-if="showEdit"
      @click="editItem(record)"
      class="relative flex items-center justify-center ml-2 text-gray-500/80 cursor-pointer"
    >
      <Icon class="text-xl" :icon="editIcon" />
    </div>
    <a-tooltip v-if="showConfirm" content="Confirm">
      <template #title>
        <span class="text-blue-500">ຢືນຢັນKYC</span>
      </template>
      <div
        @click="confirmItem(record)"
        class="relative flex items-center justify-center ml-2 text-blue-600/80 cursor-pointer"
      >
        <Icon class="text-xl" :icon="confirmIcon" />
      </div>
    </a-tooltip>
    <a-tooltip v-if="showCancle" content="Cancel">
      <template #title>
        <span class="text-red-500">ປະຕິເສດKYC</span>
      </template>
      <div
        @click="cancleItem(record)"
        class="relative flex items-center justify-center ml-2 text-red-600/80 cursor-pointer"
      >
        <Icon class="text-xl" :icon="cancleIcon" />
      </div>
    </a-tooltip>

    <a-popconfirm
      v-if="showDelete"
      title="ທ່ານຕ້ອງການລືບຂໍ້ມູນນີ້ເເທ້ບໍ່ ?"
      @confirm="deleteItem(record)"
      okText="ຍືນຍັນ"
      cancelText="ຍົກເລີກ"
    >
      <div class="relative flex items-center justify-center ml-2 cursor-pointer text-red-500/80">
        <Icon class="text-[20px]" :icon="deleteIcon" />
      </div>
    </a-popconfirm>
  </div>
</template> -->
<template>
  <div class="action-group">
    <div
      v-if="showVerify"
      @click="verifyItem(record)"
      class="action-icon text-gray-500/80"
    >
      <Icon class="icon-size" :icon="verifyIcon" />
    </div>
    <div
      v-if="showView"
      @click="viewItem(record)"
      class="action-icon text-green-500/80"
    >
      <Icon class="icon-size" :icon="viewIcon" />
    </div>
    <div
      v-if="showDownload"
      @click="downloadItem(record)"
      class="action-icon text-green-500/80"
    >
      <Icon class="icon-size" :icon="downloadIcon" />
    </div>
    <div
      v-if="showAdd"
      @click="addItem(record)"
      class="action-icon text-green-500/80"
    >
      <Icon class="icon-size" :icon="addIcon" />
    </div>
    <div
      v-if="showEdit"
      @click="editItem(record)"
      class="action-icon text-gray-500/80"
    >
      <Icon class="icon-size" :icon="editIcon" />
    </div>
    <a-tooltip v-if="showConfirm" content="Confirm">
      <div @click="confirmItem(record)" class="action-icon text-blue-600/80">
        <Icon class="icon-size" :icon="confirmIcon" />
      </div>
    </a-tooltip>
    <a-tooltip v-if="showCancle" content="Cancel">
      <div @click="cancleItem(record)" class="action-icon text-red-600/80">
        <Icon class="icon-size" :icon="cancleIcon" />
      </div>
    </a-tooltip>
    <a-popconfirm
      v-if="showDelete"
      title="ທ່ານຕ້ອງການລືບຂໍ້ມູນນີ້ເເທ້ບໍ່ ?"
      @confirm="deleteItem(record)"
      okText="ຍືນຍັນ"
      cancelText="ຍົກເລີກ"
    >
      <div class="action-icon text-red-500/80">
        <Icon class="icon-size" :icon="deleteIcon" />
      </div>
    </a-popconfirm>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps({
  record: Object,
  addIcon: {
    type: String,
    default: "material-symbols:add-circle-outline-rounded",
  },
  viewIcon: { type: String, default: "ph:eye-bold" },
  verifyIcon: { type: String, default: "ic:baseline-domain-verification" },
  downloadIcon: { type: String, default: "material-symbols:download" },
  editIcon: { type: String, default: "solar-pen-bold" },
  confirmIcon: { type: String, default: "line-md:confirm" },
  cancleIcon: { type: String, default: "mdi:cancel-bold" },
  deleteIcon: { type: String, default: "solar-trash-bin-2-bold" },
  showVerify: { type: Boolean, default: false },
  showDownload: { type: Boolean, default: false },
  showView: { type: Boolean, default: false },
  showAdd: { type: Boolean, default: false },
  showEdit: { type: Boolean, default: true },
  showDelete: { type: Boolean, default: true },
  showConfirm: { type: Boolean, default: false },
  showCancle: { type: Boolean, default: false },
});

const emits = defineEmits([
  "view",
  "edit",
  "delete",
  "add",
  "confirm",
  "cancle",
]);

const viewItem = (record) => {
  emits("view", record);
};
const confirmItem = (record) => {
  emits("confirm", record);
};
const cancleItem = (record) => {
  emits("cancle", record);
};

const verifyItem = (record) => {
  emits("verify", record);
};

const downloadItem = (record) => {
  emits("download", record);
};

const addItem = (record) => {
  emits("add", record);
};

const editItem = (record) => {
  emits("edit", record);
};

const deleteItem = (record) => {
  emits("delete", record);
};
</script>

<style scoped>
.action-group {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 8px;
  padding: 8px;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.icon-size {
  font-size: clamp(1rem, 1.5vw, 1.5rem);
}
</style>
