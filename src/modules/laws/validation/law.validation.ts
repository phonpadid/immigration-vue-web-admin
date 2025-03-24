import type { Rule } from "ant-design-vue/es/form";

export const rulesLaws: Record<string, Rule[]> = {
  name: [{ required: true, message: "ກະລຸນາປ້ອນຊື່", trigger: "change" }],
  file: [
    {
      validator: (_, value) => {
        console.log("File validation received:", value);

        if (!value) {
          return Promise.reject("ກະລຸນາອັບໂຫລດໄຟຣ໌ກ່ອນ");
        }

        // กรณีค่าเป็น FileList หรือ Array
        const file = Array.isArray(value) ? value[0] : value;

        if (!(file instanceof File)) {
          return Promise.reject("ຂໍ້ມູນບໍ່ຖືກຕ້ອງ");
        }

        const allowedTypes = ["application/pdf"];
        const maxSize = 100 * 1024 * 1024; // 100MB

        if (!allowedTypes.includes(file.type)) {
          return Promise.reject("ປະເພດໄຟຣທີ່ຮອງຮັບ: PDF");
        }

        if (file.size > maxSize) {
          return Promise.reject("ຂະໜາດໄຟຣຕ້ອງບໍ່ເກີນ 100MB");
        }

        return Promise.resolve();
      },
      trigger: ["change", "blur"], // ใช้ trigger หลายตัว
    },
  ],
};
