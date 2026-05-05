import api from "./api";

const reviewService = {
  getTopReviews: async () => {
    try {
      const response = await api.get("/reviews/top");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải đánh giá";
    }
  },
};

export default reviewService;
