import axios, { isAxiosError } from 'axios';
import NProgress from 'nprogress';

import { env } from '@/configs/env';
import { localstorageKey } from '@/constants/localstorageKey';

let requestCount = 0;

const instance = axios.create({
  baseURL: env.API_URL,
});

instance.interceptors.request.use(
  config => {
    // ถ้าเป็น request แรกที่เริ่มส่ง ให้เปิด loading bar
    if (requestCount === 0) {
      NProgress.start();
    }
    requestCount++;

    const accessToken = localStorage.getItem(localstorageKey.accessToken);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response Interceptor: ดักจับตอนที่ได้ Response กลับมา
instance.interceptors.response.use(
  response => {
    requestCount--; // ลดจำนวน request ที่รอ
    // ถ้าไม่มี request ที่รอแล้ว ให้ปิด loading bar
    if (requestCount === 0) {
      NProgress.done();
    }
    return response;
  },
  error => {
    requestCount--; // ลดจำนวน request ที่รอ (แม้จะเกิด error ก็ตาม)
    // ถ้าไม่มี request ที่รอแล้ว ให้ปิด loading bar
    if (requestCount === 0) {
      NProgress.done();
    }

    if (isAxiosError(error)) {
      const baseURL = env.BASE_URL;
      if (
        error.response?.status === 401 &&
        window.location.pathname !== `${baseURL}/login`
      ) {
        localStorage.removeItem(localstorageKey.accessToken);
        window.location.href = `${baseURL}/login`;
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
