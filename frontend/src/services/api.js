import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 0, // Đặt bằng 0 (không giới hạn thời gian) để tránh trình duyệt ngắt kết nối
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        console.warn("Phiên đăng nhập đã hết hạn hoặc bạn không có quyền!");
        localStorage.removeItem("token");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);
export default api;
