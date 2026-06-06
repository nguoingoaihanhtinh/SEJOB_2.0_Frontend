import axios from "axios";
// import {
//   getAuthFromCookies,
//   clearAuthCookies,
// } from "../CookieHelper/CookieHelper";
// import { message } from "antd";
import { BE_ENPOINT } from "src/settings/localVar";
import { PUBLIC_ENPOINT } from "../../settings/localVar";

const productURL = PUBLIC_ENPOINT;
const developmentURL = BE_ENPOINT;

const baseURL = import.meta.env.MODE === "production" ? productURL : developmentURL;

const instance = axios.create({
  baseURL: baseURL,
  timeout: 60000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "ngrok-skip-browser-warning": "69420"
  },
});

// Interceptor cho requests
instance.interceptors.request.use(
  (config) => {
    // const authCookies = getAuthFromCookies();
    // if (authCookies.token) {
    //   config.headers["Authorization"] = `Bearer ${authCookies.accessToken}`;
    // }

    // For FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Đảm bảo signal được truyền qua nếu có
    if (config.signal) {
      // Thêm listener để xử lý khi request bị hủy
      config.signal.addEventListener("abort", () => {
        // Có thể thêm logic cleanup nếu cần
      });
    }

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Interceptor cho responses
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Kiểm tra xem lỗi có phải do request bị hủy không
    if (axios.isCancel(error)) {
      // Trả về một error đặc biệt cho cancelled requests
      const cancelError = new Error("Request was cancelled");
      cancelError.name = "AbortError";
      return Promise.reject(cancelError);
    }

    if (error.response) {
      error.customData = error.response.data;
    }
    return Promise.reject(error);
  }
);

export default instance;

// Thêm một utility function để tạo request có thể hủy
export const createCancellableRequest = (requestFn) => {
  const controller = new AbortController();
  const promise = requestFn(controller.signal);
  return {
    promise,
    controller,
  };
};
