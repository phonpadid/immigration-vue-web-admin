<script setup lang="ts">
import { usefeedbackStore } from "../store/feedback.store";
import type { FeedbackResponse } from "../interface/feedbacks.interface";
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import { Modal } from "ant-design-vue";
import UiButton from "@/components/button/UiButton.vue";

/*************************************************************** */
const { getDetails, deleteFeedback } = usefeedbackStore();
const { params } = useRoute();
const dataFeedbacks = ref<FeedbackResponse>();
const feedbackId = Number(params.id);
const isLoading = ref(false);

/*************************************************************** */
const getFeedbackDeatails = async () => {
  try {
    isLoading.value = true;
    const data = await getDetails(feedbackId);

    if (data) {
      dataFeedbacks.value = data;
    }
  } catch (err) {
    console.log(err);
  } finally {
    isLoading.value = false;
  }
};

/*************************************************************** */
const confirmDeleteFeedback = () => {
  Modal.confirm({
    title: "ຢືນຢັນການລົບ",
    content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້?",
    okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
    cancelText: "ບໍ່,ຍົກເລີກ",
    okType: "danger",
    onOk: async () => {
      try {
        isLoading.value = true;
        await deleteFeedback(feedbackId);
        alert("ລົບຂໍ້ມູນສຳເລັດ");
      } catch (err) {
        console.error("Error:", err);
      } finally {
        isLoading.value = false;
      }
    },
  });
};

/*************************************************************** */

onMounted(() => {
  getFeedbackDeatails();
});
</script>

<template>
  <div class="relative">
    <div class="px-4 grid gap-4 sm:grid-cols-3 sm:gap-6 md:gap-12 mt-12">
      <dl>
        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ຊື
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          {{ dataFeedbacks?.name }}
        </dd>
        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ເບີໂທ
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          {{ dataFeedbacks?.tel }}
        </dd>
        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ຄຳຕິຊົມ
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          {{ dataFeedbacks?.message }}
        </dd>
        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          ທີ່​ຢູ່​ອີ​ເມວ
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          {{ dataFeedbacks?.email }}
        </dd>
      </dl>
      <dl>
        <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
          URLຂອງຮູບຫຼືວິດີໂອທີ່ຕິດຄັດມາກັບຄຳຕິຊົມ
        </dt>
        <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
          {{ dataFeedbacks?.media || "ບໍ່ມີຂໍ້ມູນ" }}
        </dd>
      </dl>
    </div>
    <UiButton
      type="primary"
      size="large"
      colorClass="!bg-red-700 hover:!bg-red-900 text-white flex items-center"
      icon="material-symbols-light:delete-outline"
      @click="confirmDeleteFeedback"
      >ລຶບ</UiButton
    >
  </div>
</template>
