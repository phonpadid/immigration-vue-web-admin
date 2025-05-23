<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { columns } from "../interface/column";
import { useLawStore } from "../store/laws.store";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/lib/stores/auth.store";
import { formatDateTime } from "@/utils/FormatDataTime";
import { Modal } from "ant-design-vue";
import {
  LAW_READ,
  LAW_WRITE,
  LAW_REMOVE,
} from "@/common/utils/PermissionGroup";
import { useNotification } from "@/utils/notificationService";
import Table from "@/components/table/Table.vue";
import UiButton from "@/components/button/UiButton.vue";
import UibuttonDropdown from "@/components/button/UibuttonDropdown.vue";
import Dropdown from "@/components/Dropdown/Dropdown.vue";
import LoadingSpinner from "@/components/loading/LoadingSpinner.vue";
import HasPermission from "@/components/CheckPermission/HasPermission.vue";

/********************************************************************************* */
const { getAlllaws, laws, isLoading, deleteLaws } = useLawStore();
const { openNotification } = useNotification();
const { push } = useRouter();
const authStore = useAuthStore();
const Loading = ref(false);
/********************************************************************************* */
const canReadLaws = computed(() => authStore.hasPermission(LAW_READ));
const canWriteLaws = computed(() => authStore.hasPermission(LAW_WRITE));
const canDeleteLaws = computed(() => authStore.hasPermission(LAW_REMOVE));

/******************************************************************** */
const menuOptions = computed(() => {
  const options = [];

  if (canReadLaws.value) {
    options.push({ key: "1", label: "ຂໍ້ມູນເອກະສານ" });
  }

  if (canWriteLaws.value) {
    options.push({ key: "2", label: "ແກ້ໄຂ" });
  }

  if (canDeleteLaws.value) {
    options.push({ key: "3", label: "ລຶບ" });
  }

  return options;
});

const addUser = () => {
  if (!canWriteLaws.value) {
    openNotification("error", "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນໄດ້", "ບໍ່ໄດ້ຮັບອະນຸຍາດ");
    return;
  }
  push({ name: "laws_add" });
};
/********************************************************************************* */
/********************************************************************************* */

const handleSelect = (key: string, record: any) => {
  if (key === "1" && canReadLaws.value) {
    push({ name: "laws_details", params: { id: record.id } });
  } else if (key === "2" && canWriteLaws.value) {
    push({ name: "laws_edit", params: { id: record.id } });
  } else if (key === "3" && canDeleteLaws.value) {
    Modal.confirm({
      title: "ຢືນຢັນການລົບ",
      content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້??",
      okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
      cancelText: "ບໍ່,ຍົກເລີກ",
      okType: "danger",
      onOk: async () => {
        try {
          Loading.value = true;
          await deleteLaws(record.id);
          alert("ລົບຂໍ້ມູນສຳເລັດ");
        } catch (err) {
          console.error("Error:", err);
        } finally {
          Loading.value = false;
        }
      },
    });
  }
};
/********************************************************************************* */

onMounted(async () => {
  if (canReadLaws.value) {
    await getAlllaws();
  } else {
    openNotification("error", "ບໍ່ສາມາດເບິ່ງຂໍ້ມູນໄດ້", "ບໍ່ໄດ້ຮັບອະນຸຍາດ");
  }
});
</script>

<template>
  <LoadingSpinner
    v-if="isLoading"
    class="absolute inset-0 flex items-center justify-center z-10"
  />
  <HasPermission :permission="LAW_READ">
    <div
      class="flex flex-col items-start justify-between p-4 sm:flex-row sm:items-center mt-4"
    >
      <h2 class="text-lg font-semibold mb-2 sm:mb-0 dark:text-white">
        ຕາຕະລາງກ່ຽວກັບກົດໝາຍແລະເອກະສານທາງດ້ານກົດໝາຍ
      </h2>
      <HasPermission :permission="LAW_WRITE">
        <UiButton
          type="primary"
          size="large"
          colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
          icon="ant-design:plus-outlined"
          @click="addUser"
          >ເພີ່ມຂໍ້ມູນ</UiButton
        >
      </HasPermission>
    </div>

    <div class="relative">
      <Table
        :columns="columns"
        :dataSource="laws.data || []"
        class="dark:bg-gray-800 dark:text-white dark:border-gray-700"
      >
        <template #created_at="{ record }">
          {{ formatDateTime(record.created_at) }}
        </template>
        <template #updated_at="{ record }">
          {{ formatDateTime(record.updated_at) }}
        </template>
        <template #action="{ record }">
          <Dropdown
            :options="menuOptions"
            @select="(key) => handleSelect(key, record)"
          >
            <UibuttonDropdown
              type="primary"
              size="small"
              colorClass="!bg-white text-gray-900 flex items-center hover:!bg-gray-200 hover:!text-gray-900 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white"
              icon="ic:baseline-more-horiz"
            ></UibuttonDropdown>
          </Dropdown>
        </template>
      </Table>
    </div>
  </HasPermission>
</template>
<style></style>
