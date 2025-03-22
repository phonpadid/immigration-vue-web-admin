import type { Rule } from "ant-design-vue/es/form";

export const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: "ກະລຸນາປ້ອນຊື່", trigger: "change" }],
  description: [
    { required: true, message: "ກະລຸນາປ້ອນຄຳອະທິບາຍ", trigger: "change" },
  ],
};
