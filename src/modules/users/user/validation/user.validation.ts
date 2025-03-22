import type { Rule } from "ant-design-vue/es/form";

export const rulesUser: Record<string, Rule[]> = {
  first_name: [{ required: true, message: "ກະລຸນາປ້ອນຊື່", trigger: "change" }],
  last_name: [
    { required: true, message: "ກະລຸນາປ້ອນນາມສະກຸນ", trigger: "change" },
  ],
  image: [
    {
      validator: (_rule: any, value: any) => {
        if (value && !(value instanceof File)) {
          return Promise.reject("ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ");
        }
        return Promise.resolve();
      },
      trigger: "change",
    },
  ],
  email: [
    { required: true, message: "ກະລຸນາປ້ອນອີເມວ", trigger: "blur" },
    { type: "email", message: "ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ", trigger: "blur" },
  ],
  password: [
    { required: true, message: "ກະລຸນາປ້ອນລະຫັດຜ່ານ", trigger: "blur" },
    { min: 6, message: "ລະຫັດຜ່ານຄວນມີຢ່າງໜ້ອຍ 6 ໂຕ", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "ກະລຸນາຢືນຢັນລະຫັດ", trigger: "blur" },
    {
      validator: (_rule: any, value: any) => {
        // ใช้ global state หรือ ref แทนการเข้าถึงผ่าน callback.form
        const formEl = document.querySelector("form");
        if (!formEl) return Promise.resolve();

        const passwordInput = formEl.querySelector('input[type="password"]');
        const password = passwordInput
          ? (passwordInput as HTMLInputElement).value
          : "";

        if (value && value !== password) {
          return Promise.reject("ລະຫັດຢືນຢັນບໍ່ກົງກັນ");
        }
        return Promise.resolve();
      },
      trigger: "blur",
    },
  ],
  role_ids: [
    { required: true, message: "ກະລຸນາເລືອກບົດບາດ", trigger: "change" },
  ],
};
