import api from "./api";

const FolioService = {
  getFolio: async (bookingId) => {
    try {
      const response = await api.get(`/folios/checkout/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải hóa đơn dịch vụ";
    }
  },
  orderService: async (data) => {
    try {
      const response = await api.post("/folios/add-service", data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi thêm dịch vụ";
    }
  },
  deleteFolioItem: async (id) => {
    try {
      const response = await api.delete(`/folios/item/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi khi hủy dịch vụ";
    }
  },
  markAsDelivered: async (id) => {
    try {
      const response = await api.put(`/folios/item/${id}/deliver`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi cập nhật trạng thái";
    }
  },
  getPendingOrders: async () => {
    try {
      const response = await api.get(`/folios/pending`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải danh sách chờ";
    }
  },
};

export default FolioService;
