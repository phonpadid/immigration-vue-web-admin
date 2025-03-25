const VITE_IMG_URL = import.meta.env.VITE_IMG_URL;

export const getImageUrl = (path: any) => `${VITE_IMG_URL}/${path}`;
