<script setup lang="ts">
import { usecontactStore } from "../store/contacts.store";
import { useRoute } from "vue-router";
import type { ContactResponse } from "../interface/contacts.interface";
import { onMounted, ref } from "vue";
import { Modal } from "ant-design-vue";
import UiButton from "@/components/button/UiButton.vue";

/****************************************************************************** */
const { getDetails, deleteContacts } = usecontactStore();
const { params } = useRoute();
const dataContacts = ref<ContactResponse>();
const contactsId = Number(params.id);
const isLoading = ref(false);

/****************************************************************************** */
const getContactsDetails = async () => {
  try {
    isLoading.value = true;
    const data = await getDetails(contactsId);

    if (data) {
      dataContacts.value = data;
    }
  } catch (err) {
    console.log(err);
  } finally {
    isLoading.value = false;
  }
};
/****************************************************************************** */
const confirmDeleteContacts = () => {
  Modal.confirm({
    title: "ຢືນຢັນການລົບ",
    content: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້?",
    okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
    cancelText: "ບໍ່,ຍົກເລີກ",
    okType: "danger",
    onOk: async () => {
      try {
        isLoading.value = true;
        await deleteContacts(contactsId);
        alert("ລົບຂໍ້ມູນສຳເລັດ");
      } catch (err) {
        console.error("Error:", err);
      } finally {
        isLoading.value = false;
      }
    },
  });
};
/****************************************************************************** */

onMounted(() => {
  getContactsDetails();
});
</script>

<template>
  <div class="relative">
    <div>
      <dl>
        <div class="grid gap-4 mb-4 sm:mb-8 md:grid-cols-2 md:gap-6 mt-12">
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ຊື
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ dataContacts?.name }}
          </dd>
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ອີເມວ
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ dataContacts?.email }}
          </dd>
          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ຂໍ້ຄວາມ
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ dataContacts?.message }}
          </dd>

          <dt class="text-gray-900 dark:text-white leading-4 font-normal mb-2">
            ໃຫ້ຄຳຄິດເຫັນເມື່ອ:
          </dt>
          <dd class="text-gray-500 dark:text-gray-400 font-light mb-4 sm:mb-5">
            {{ dataContacts?.created_at }}
          </dd>
        </div>
      </dl>
    </div>
    <UiButton
      type="primary"
      size="large"
      colorClass="!bg-red-700 hover:!bg-red-900 text-white flex items-center"
      icon="material-symbols-light:delete-outline"
      @click="confirmDeleteContacts"
      >ລຶບ</UiButton
    >
  </div>
</template>
