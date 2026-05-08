import api from "./api";

const DestinationService = {
  getAll: async () => {
    try {
      const response = await api.get("/destinations");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải dữ liệu";
    }
  },
};

export default DestinationService;
