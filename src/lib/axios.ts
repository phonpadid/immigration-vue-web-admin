import axios, { type AxiosRequestConfig } from "axios";
import { Modal } from "ant-design-vue";

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

const authAxios = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "lo",
  },
});

function addHeaders(
  config?: AxiosRequestConfig,
  data?: any
): AxiosRequestConfig {
  const token = localStorage.getItem("access_token") || null;
  if (!config) config = {};
  if (!config.headers) config.headers = {};
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  if (data && typeof data === "object" && !(data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  } else {
    config.headers["Content-Type"] = "multipart/form-data";
  }
  return config;
}

authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      if (!error.response) {
        console.error("Network Error:", error);
        return Promise.reject(error);
      }

      const { status, data, config } = error.response;

      // ✅ [DEBUG] แสดง Log ของทุก Error เพื่อการตรวจสอบ
      console.error(
        `[AXIOS ERROR] Status: ${status} | URL: ${config.url}`,
        data
      );

      // ✅ [เพิ่มใหม่] ตรวจสอบว่าเป็น Error จากหน้า Login หรือไม่
      if (
        config.url.includes("/auth/login") &&
        (status === 400 || status === 401)
      ) {
        Modal.warning({
          title: "ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ", // "Login Failed"
          content: "ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ! ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.", // "Email or password incorrect! Please try again."
          closable: true,
          footer: null,
        });
        // คืนค่า reject เพื่อให้ catch block ใน login store ทำงานต่อได้ แต่ไม่ทำอย่างอื่นใน interceptor
        return Promise.reject(error);
      }

      switch (status) {
        case 400:
          Modal.warning({
            title: "ມີບາງຢ່າງຜິດພາດ!",
            content: "ຂໍ້ມູນທີ່ສົ່ງໄປບໍ່ຖືກຕ້ອງ!",
            closable: true,
            footer: null,
          });
          break;
        case 401:
          // ✅ [แก้ไข] เปลี่ยนข้อความให้สื่อความหมายมากขึ้น
          Modal.warning({
            title: "ເຊສຊັນໝົດອາຍຸ!", // "เซสชันหมดอายุ!"
            content: "ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່ອີກຄັ້ງ.", // "กรุณาเข้าสู่ระบบใหม่อีกครั้ง"
            closable: true,
            footer: null,
          });
          console.warn("Unauthorized (401)! Logging out...");
          localStorage.removeItem("access_token");
          window.location.href = "/admin/login";
          break;
        case 403:
          Modal.error({
            title: "ທ່ານບໍ່ມີສິດເຂົ້າໃຊ້!",
            content: "ກະລຸນາຕິດຕໍ່ Admin",
            closable: true,
            footer: null,
          });
          break;
        case 404:
          console.error("API Not Found:", error.config.url);
          break;
        case 500:
          Modal.error({
            title: "ມີຂໍ້ຜິດພາດໃນ Server!",
            content: "ກະລຸນາລອງໃໝ່ອີກຄັ້ງ",
            closable: true,
            footer: null,
          });
          break;
        default:
          console.error("Unhandled Error:", error);
      }
    } catch (err) {
      console.error("Interceptor Error:", err);
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  async post(url: string, data?: any, config?: AxiosRequestConfig) {
    return await authAxios.post(
      url.startsWith("/") ? url : `/${url}`,
      data,
      addHeaders(config, data)
    );
  },
};

export const api = {
  async get(url: string, config?: AxiosRequestConfig) {
    return await authAxios.get(
      url.startsWith("/") ? url : `/${url}`,
      addHeaders(config)
    );
  },
  async post(url: string, data?: any, config?: AxiosRequestConfig) {
    return await authAxios.post(
      url.startsWith("/") ? url : `/${url}`,
      data,
      addHeaders(config, data)
    );
  },
  async put(url: string, data?: any, config?: AxiosRequestConfig) {
    return await authAxios.put(
      url.startsWith("/") ? url : `/${url}`,
      data,
      addHeaders(config, data)
    );
  },
  async delete(url: string, config?: AxiosRequestConfig) {
    return await authAxios.delete(
      url.startsWith("/") ? url : `/${url}`,
      addHeaders(config)
    );
  },
};

export default authAxios;
