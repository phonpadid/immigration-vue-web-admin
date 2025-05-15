<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useLawStore } from "../store/laws.store";
import { useRoute, useRouter } from "vue-router";
import type { LawResponse } from "../interface/laws.interface";
import { formatDateTime } from "@/utils/FormatDataTime";
import { getFileUrl } from "@/utils/ConfigPathImage";
import { Modal } from "ant-design-vue";
import { useNotification } from "@/utils/notificationService";
import {
  LAW_READ,
  LAW_REMOVE,
  LAW_WRITE,
} from "@/common/utils/PermissionGroup";
import { useAuthStore } from "@/lib/stores/auth.store";
import HasPermission from "@/components/CheckPermission/HasPermission.vue";
import UiButton from "@/components/button/UiButton.vue";

/*********************************************** */

const { getDetailsLaw, deleteLaws } = useLawStore();
const lawData = ref<LawResponse | null>(null);
const authStore = useAuthStore();
const { openNotification } = useNotification();
const isLoading = ref(false);
const route = useRoute();
const router = useRouter();
const lawsId = Number(route.params.id);
const canReadLaws = computed(() => authStore.hasPermission(LAW_READ));
const canWriteLaws = computed(() => authStore.hasPermission(LAW_WRITE));
const canDeleteLaws = computed(() => authStore.hasPermission(LAW_REMOVE));

/******************************************************************* */

const getFileName = (filePath: string | undefined) => {
  if (!filePath) return "";
  return filePath.split("/").pop() || filePath;
};

const getLaws = async () => {
  if (!canReadLaws.value) {
    openNotification("error", "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນໄດ້", "ບໍ່ໄດ້ຮັບອະນຸຍາດ");
    return;
  }
  try {
    const response = await getDetailsLaw(lawsId);
    if (response) {
      lawData.value = response;
    }
  } catch (error) {
    console.error("Error fetching law details:", error);
  }
};

/******************************************************* */
const handleRemoveLaws = () => {
  if (!canDeleteLaws.value) {
    openNotification("error", "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນໄດ້", "ບໍ່ໄດ້ຮັບອະນຸຍາດ");
    return;
  }
  Modal.confirm({
    title: "ຢືນຢັນການລົບ",
    content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້??",
    okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
    cancelText: "ບໍ່,ຍົກເລີກ",
    okType: "danger",
    onOk: async () => {
      try {
        isLoading.value = true;
        deleteLaws(lawsId);
        router.push({ name: "laws" });
        openNotification("success", "ລຶບຂໍ້ມູນ", "ລົບຂໍ້ມູນສຳເລັດ");
      } catch (err) {
        console.error("Error:", err);
        openNotification("error", "ລຶບຂໍ້ມູນ", "ເກີດຂໍ້ຜິດພາດໃນການລຶບ");
      } finally {
        isLoading.value = false;
      }
    },
  });
};
/******************************************************* */
const handleEdit = () => {
  if (!canWriteLaws.value) {
    openNotification("error", "ບໍ່ສາມາດເພີ່ມຂໍ້ມູນໄດ້", "ບໍ່ໄດ້ຮັບອະນຸຍາດ");
    return;
  }
  router.push({ name: "laws_edit" });
};
/******************************************************* */

onMounted(async () => {
  await getLaws();
});
</script>

<template>
  <HasPermission :permission="LAW_READ">
    <div class="relative">
      <div v-if="lawData">
        <dl>
          <div class="grid gap-4 mb-4 sm:mb-8 md:grid-cols-2 md:gap-6 mt-12">
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ໄຟລ໌ເອກະສານ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              <a
                v-if="lawData.file"
                :href="getFileUrl(lawData.file)"
                class="font-medium text-primary-600 dark:text-primary-500 hover:underline"
                target="_blank"
              >
                {{ getFileName(lawData.file) }}
              </a>
              <span v-else>ບໍ່ມີຟາຍ</span>
            </dd>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ຊື
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ lawData.name }}
            </dd>

            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເວລາສ້າງ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ formatDateTime(lawData.created_at) }}
            </dd>
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເວລາອັບເດດ:
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              {{ formatDateTime(lawData.updated_at) }}
            </dd>
          </div>
        </dl>
        <div class="flex gap-4">
          <HasPermission :permission="LAW_WRITE">
            <UiButton
              @click="handleEdit"
              type="submit"
              size="large"
              colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
              icon="material-symbols:edit-square"
            >
              ແກ້ໄຂ
            </UiButton>
          </HasPermission>
          <HasPermission :permission="LAW_REMOVE">
            <UiButton
              @click="handleRemoveLaws"
              type="button"
              size="large"
              icon="material-symbols:delete-outline-sharp"
              colorClass="!bg-red-500 hover:!bg-red-700 text-white flex items-center"
            >
              ລຶບ
            </UiButton>
          </HasPermission>
        </div>
      </div>

      <div v-else class="p-4 flex items-center justify-center">
        ກຳລັງໂຫລດຂໍ້ມູນ...
      </div>
    </div>
  </HasPermission>
</template>
