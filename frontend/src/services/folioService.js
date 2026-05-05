import api from "./api";

const FolioService = {
  getFolio: async (bookingId) => {
    try {
      const response = await api.get(`/folios/checkout/${bookingId}`); // Thay đường dẫn khớp với route của em
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải hóa đơn dịch vụ";
    }
  },
  orderService: async (data) => {
    try {
      // data gồm: { booking_id, service_id, quantity }
      const response = await api.post("/folios/add-service", data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi thêm dịch vụ";
    }
  },
};

export default FolioService;
