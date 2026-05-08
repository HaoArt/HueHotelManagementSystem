import api from "./api";

const couponService = {
  getActiveCoupons: async () => {
    try {
      const response = await api.get("/coupons/active");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải khuyến mãi";
    }
  },
  getActiveCouponsForUser: async () => {
    try {
      const response = await api.get("/coupons/my-active");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải mã giảm giá của bạn";
    }
  },
  getAllCoupons: async () => {
    try {
      const response = await api.get("/coupons");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải khuyến mãi";
    }
  },
  createCoupon: async (data) => {
    try {
      const response = await api.post("/coupons", data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tạo mã giảm giá";
    }
  },
  updateCoupon: async (id, data) => {
    try {
      const response = await api.put(`/coupons/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi cập nhật mã giảm giá";
    }
  },
  deleteCoupon: async (id) => {
    try {
      const response = await api.delete(`/coupons/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi xóa mã giảm giá";
    }
  },
};

export default couponService;
