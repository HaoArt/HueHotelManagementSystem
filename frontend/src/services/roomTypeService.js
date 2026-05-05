import api from "./api";

const RoomTypeService = {
  getAllRoomTypes: async () => {
    try {
      const response = await api.get("/room-types");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải hạng phòng";
    }
  },
  createRoomType: async (data) => {
    try {
      const response = await api.post("/room-types", data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tạo hạng phòng";
    }
  },
  updateRoomType: async (id, data) => {
    try {
      const response = await api.put(`/room-types/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi cập nhật hạng phòng";
    }
  },
  deleteRoomType: async (id) => {
    try {
      const response = await api.delete(`/room-types/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi xóa hạng phòng";
    }
  },
  getReviewsByRoomTypeId: async (id) => {
    try {
      const response = await api.get(`/room-types/${id}/reviews`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải đánh giá";
    }
  },
  getRoomTypeById: async (id) => {
    try {
      const response = await api.get(`/room-types/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi khi lấy thông tin hạng phòng";
    }
  },
  getTopRoomTypes: async () => {
    try {
      const response = await api.get("/room-types/top");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải top phòng";
    }
  },
  searchRoomTypes: async (searchData) => {
    try {
      const response = await api.get("/room-types/search", {
        params: searchData,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tìm kiếm loại phòng";
    }
  },
};

export default RoomTypeService;
