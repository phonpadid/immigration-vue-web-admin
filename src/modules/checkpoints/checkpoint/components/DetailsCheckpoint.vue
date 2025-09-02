<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCheckpointStore } from "../store/checkpoint.store";
import { getImageUrl } from "@/utils/ConfigPathImage";
import { Icon } from "@iconify/vue";
import { TABS_CONFIG } from "../interface/checkpoint.constan";
import { formatDateTime } from "@/utils/FormatDataTime";
import Tab from "@/components/Tab/Tab.vue";
import NewsEditorContent from "@/components/editor/NewsEditorContent.vue";
import UiButton from "@/components/button/UiButton.vue";

const route = useRoute();
const router = useRouter();
const checkpointStore = useCheckpointStore();
const checkpoint = ref<any>(null);
const activeTab = ref("1");

// โหลดข้อมูล checkpoint
onMounted(async () => {
  try {
    const id = Number(route.params.id);
    const response = await checkpointStore.getCheckpointById(id);
    checkpoint.value = response;
  } catch (error) {
    console.error("Error loading checkpoint:", error);
  }
});

// ฟังก์ชันสำหรับการแก้ไข
const handleEdit = () => {
  router.push(`/checkpoint/edit/${route.params.id}`);
};

// ฟังก์ชันสำหรับการลบ
const handleDelete = async () => {
  if (window.confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນນີ້?")) {
    try {
      await checkpointStore.deleteCheckpoint(Number(route.params.id));
      router.push("/checkpoint");
    } catch (error) {
      console.error("Error deleting checkpoint:", error);
    }
  }
};
</script>

<template>
  <div class="relative ">
    <div v-if="checkpoint">
      <!-- Tabs for different languages -->
      <Tab v-model:activeKey="activeTab" :tabs="TABS_CONFIG">
        <template v-for="tab in TABS_CONFIG" :key="tab.key" #[tab.slotName]>
          <div
            class="px-4 my-4 grid gap-4 sm:mb-5 sm:grid-cols-2 sm:gap-6 md:gap-12"
          >
            <dl>
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ຊື່ດ່ານ
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                <p>
                  {{
                    checkpoint.translates.find((t: any) => t.lang === tab.lang)
                      ?.name
                  }}
                </p>
              </dd>
            </dl>
            <dl>
              <dt
                class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
              >
                ທີຢູ່ດ່ານ
              </dt>
              <dd
                class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
              >
                <p>
                  {{
                    checkpoint.translates.find((t: any) => t.lang === tab.lang)
                      ?.address
                  }}
                </p>
              </dd>
            </dl>
          </div>

          <dl class="px-4 mb-4">
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເນື້ອຫາດ່ານ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              <NewsEditorContent
                :content="
                  checkpoint.translates.find((t:any) => t.lang === tab.lang)
                    ?.content
                "
              />
            </dd>
          </dl>

          <dl class="px-4 mb-4">
            <dt
              class="text-gray-900 dark:text-white leading-4 font-normal mb-2"
            >
              ເປີດ-ປິດດ່ານ
            </dt>
            <dd
              class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5"
            >
              <p>
                {{
                  checkpoint.translates.find((t: any) => t.lang === tab.lang)
                    ?.time_operation
                }}
              </p>
            </dd>
          </dl>
        </template>
      </Tab>

      <!-- Basic Information -->
      <div class="px-4 my-4 grid gap-4 sm:mb-5 sm:grid-cols-2">
        <dl>
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ປະເພດດ່ານ
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ checkpoint.category?.translates?.[0]?.title || "ບໍ່ມີຂໍ້ມູນ" }}
          </dd>
        </dl>
        <dl>
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ແຂວງທີຢູ່ຂອງດ່ານ
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ checkpoint.province?.translates?.[0]?.name || "ບໍ່ມີຂໍ້ມູນ" }}
          </dd>
        </dl>

        <dl>
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ມີຊາຍແດນຕິດກັບ
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ checkpoint.country }}
          </dd>
        </dl>
      </div>

      <!-- Image and Contact Information -->
      <div
        class="px-4 mb-4 grid gap-4 sm:mb-5 sm:grid-cols-2 sm:gap-6 md:gap-12"
      >
        <dl>
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ຮູບພາບ
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            <div class="relative w-full mx-auto">
              <img
                v-if="checkpoint.image"
                class="w-full object-cover rounded-md"
                :src="getImageUrl(checkpoint.image)"
                alt="Checkpoint image"
              />
            </div>
          </dd>
        </dl>
        <dl>
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ເບີໂທຕິດຕໍ່
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ checkpoint.phone_number }}
          </dd>

          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ອີເມວຕິດຕໍ່
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ checkpoint.email }}
          </dd>

          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ຮັບ Visa
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            <Icon
              v-if="checkpoint.visa"
              icon="mdi:check-circle"
              class="w-8 h-8 text-green-500"
            />
            <Icon v-else icon="mdi:close-circle" class="w-8 h-8 text-red-500" />
          </dd>

          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ຮັບ E Visa
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            <Icon
              v-if="checkpoint.e_visa"
              icon="mdi:check-circle"
              class="w-8 h-8 text-green-500"
            />
            <Icon v-else icon="mdi:close-circle" class="w-8 h-8 text-red-500" />
          </dd>
        </dl>
      </div>

      <!-- Map -->
      <dl class="px-4 mb-4">
        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ແຜ່ນທີ່
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          {{ checkpoint.link_map }}
        </dd>
      </dl>

      <!-- Timestamps -->
      <div
        class="px-4 mt-4 grid gap-4 sm:mb-5 sm:grid-cols-2 sm:gap-6 md:gap-12"
      >
        <dl>
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ເພີ່ມເມື່ອ:
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ formatDateTime(checkpoint.created_at) }}
          </dd>
        </dl>
        <dl>
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ອັບເດດລ່າສຸດເມື່ອ:
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ formatDateTime(checkpoint.updated_at) }}
          </dd>
        </dl>
      </div>

      <!-- Action Buttons -->
      <div class="p-4 flex items-center gap-4">
        <UiButton
          size="large"
          icon="material-symbols:edit-square"
          colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
          @click="handleEdit"
        >
          ແກ້ໄຂ
        </UiButton>

        <UiButton
          size="large"
          icon="material-symbols:delete-outline-sharp"
          colorClass="!bg-red-700 hover:!bg-red-900 text-white flex items-center"
          @click="handleDelete"
        >
          ລຶບ
        </UiButton>
      </div>
    </div>
  </div>
</template>
