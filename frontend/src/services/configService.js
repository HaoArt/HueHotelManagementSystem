import api from "./api";

const ConfigService = {
  getConfigs: async () => {
    try {
      const response = await api.get("/configs");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải cấu hình hệ thống";
    }
  },

  updateConfigs: async (settings) => {
    try {
      const response = await api.put("/configs", { settings });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi cập nhật cấu hình";
    }
  },
  getConfigByKey: async (key) => {
    try {
      const res = await api.get("/configs");
      const configs = res.data.data;
      const target = configs.find((c) => c.config_key === key);
      return target ? target.config_value : null;
    } catch (error) {
      console.error(`Lỗi khi lấy cấu hình ${key}:`, error);
      return null;
    }
  },
};

export default ConfigService;
