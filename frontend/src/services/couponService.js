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
  getAllCoupons: async () => {
    try {
      const response = await api.get("/coupons");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải khuyến mãi";
    }
  },
};

export default couponService;
