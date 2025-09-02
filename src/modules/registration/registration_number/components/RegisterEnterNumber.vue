<script setup lang="ts">
import { useRegistrationnumberStore } from "../store/registration.number.store";
import type { NumberResponse } from "../interface/registration.number.interface";
import { onMounted, ref } from "vue";
import { Icon } from "@iconify/vue";
import { message } from "ant-design-vue";
import UiModal from "@/components/Modal/UiModal.vue";
import UiInput from "@/components/Input/UiInput.vue";
import UiButton from "@/components/button/UiButton.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";

const { getRegiter_enter, incrementRegisterEnter, decrementRegisterEnter } =
  useRegistrationnumberStore();

const registerData = ref<NumberResponse>({
  per_day: 0,
  per_mouth: 0,
  per_year: 0,
});

// สำหรับ Modal
const showModal = ref(false);
const confirmLoading = ref(false);
const incrementValue = ref<string>("");
const modalType = ref<"increment" | "decrement">("increment");

const fetchData = async () => {
  try {
    const response = await getRegiter_enter();
    if (response) {
      registerData.value = response;
    }
  } catch (error) {
    console.error("Error fetching register data:", error);
    message.error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ");
  }
};

const handleShowModal = (type: "increment" | "decrement") => {
  modalType.value = type;
  incrementValue.value = "";
  showModal.value = true;
};

const handleOk = async () => {
  if (!incrementValue.value || isNaN(Number(incrementValue.value))) {
    message.error("ກະລຸນາປ້ອນຕົວເລກໃຫ້ຖືກຕ້ອງ");
    return;
  }

  const value = Number(incrementValue.value);
  if (value <= 0) {
    message.error("ກະລຸນາປ້ອນຕົວເລກທີ່ຫຼາຍກວ່າ 0");
    return;
  }

  confirmLoading.value = true;
  try {
    if (modalType.value === "increment") {
      await incrementRegisterEnter(value);
    } else {
      await decrementRegisterEnter(value);
    }
    showModal.value = false;
    await fetchData();
  } catch (error) {
    message.error("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ");
  } finally {
    confirmLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div
    class="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mb-4 relative "
  >
    <h2 class="text-2xl font-bold mb-8 text-center dark:text-white">
      ການລົງທະບຽນເຂົ້າ
    </h2>
    <dl
      class="grid max-w-screen-md gap-8 mx-auto text-gray-900 sm:grid-cols-3 dark:text-white"
    >
      <div class="flex flex-col items-center justify-center">
        <dt class="mb-2 text-2xl md:text-3xl font-extrabold">
          {{ registerData.per_day }}
        </dt>
        <dd class="font-light text-gray-500 dark:text-gray-400">ເຂົ້າມື້ນີ້</dd>
      </div>
      <div class="flex flex-col items-center justify-center">
        <dt class="mb-2 text-2xl md:text-3xl font-extrabold">
          {{ registerData.per_mouth }}
        </dt>
        <dd class="font-light text-gray-500 dark:text-gray-400">
          ເຂົ້າ 30 ມື້ກ່ອນ
        </dd>
      </div>
      <div class="flex flex-col items-center justify-center">
        <dt class="mb-2 text-2xl md:text-3xl font-extrabold">
          {{ registerData.per_year }}
        </dt>
        <dd class="font-light text-gray-500 dark:text-gray-400">
          ເຂົ້າ 1 ປີກ່ອນ
        </dd>
      </div>
    </dl>

    <div class="absolute top-2 right-2 flex gap-1">
      <UiButton
        @click="handleShowModal('decrement')"
        colorClass="!bg-red-200 hover:!bg-red-600 text-white flex items-center justify-center rounded-lg !p-0 !w-8 !h-8"
      >
        <Icon
          icon="material-symbols:horizontal-rule-rounded"
          class="text-2xl text-red-600 hover:text-red-900"
        />
      </UiButton>
      <UiButton
        type="primary"
        @click="handleShowModal('increment')"
        colorClass="!bg-primary-200 hover:!bg-primary-600 text-white flex items-center justify-center rounded-lg !p-0 !w-8 !h-8"
      >
        <Icon
          icon="material-symbols:add-rounded"
          class="text-2xl text-primary-600 hover:text-primary-900"
        />
      </UiButton>
    </div>
    <UiModal
      :title="
        modalType === 'increment' ? 'ຈຳນວນການລົງທະບຽນ' : 'ຈຳນວນການລົງທະບຽນ'
      "
      v-model:visible="showModal"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
    >
      <hr />
      <br />
      <div class="w-full space-y-2">
        <span>ຈຳນວນ</span>
        <UiInput
          v-model="incrementValue"
          type="number"
          :placeholder="
            modalType === 'increment'
              ? 'ປ້ອນຈຳນວນ'
              : 'ປ້ອນຈຳນວນ'
          "
          class="w-full"
          size="large"
        />
      </div>
      <template #footer>
        <div class="flex justify-start gap-2 mt-4">
          <UiButton
            type="primary"
            size="large"
            colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
            :loading="confirmLoading"
            @click="handleOk"
          >
            ບັນທຶກ
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>
