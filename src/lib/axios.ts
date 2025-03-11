import axios, { type AxiosRequestConfig } from "axios";
import { Modal } from "ant-design-vue";

// ✅ ตั้งค่า baseURL ให้ถูกต้อง
const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

// ✅ ตั้งค่าเริ่มต้นให้ Axios
const authAxios = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "lo",
  },
});

// ✅ ฟังก์ชันเพิ่ม Header ให้ Request
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

// ✅ Interceptor จัดการ Response Error
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      if (!error.response) {
        console.error("Network Error:", error);
        return Promise.reject(error);
      }

      const { status } = error.response;

      switch (status) {
        case 400:
          Modal.warning({
            title: "ມີບາງຢ່າງຜິດພາດ!",
            content: "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ!",
            closable: true,
            footer: null,
          });
          break;
        case 401:
          console.warn("Unauthorized! Logging out...");
          localStorage.removeItem("access_token");
          window.location.href = "/login";
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
