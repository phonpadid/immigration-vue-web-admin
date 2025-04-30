const VITE_IMG_URL = import.meta.env.VITE_IMG_URL;

export const getImageUrl = (path: any) => `${VITE_IMG_URL}/${path}`;

/************************Deatils Country******************************** */
export const imgBaseUrl: string =
  import.meta.env.VITE_IMG_URL || "http://178.128.20.203:81/api";
/************************Deatils Country******************************** */

export const getFileUrl = (filePath: string | undefined) => {
  if (!filePath) return "";
  return `${imgBaseUrl}/${filePath}`;
};
export const imageBaseUrl =
  import.meta.env.VITE_IMG_URL || "http://178.128.20.203:81/api";

