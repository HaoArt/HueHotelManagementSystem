import api from "./api";

const RoomService = {
  findAvailableRooms: async (checkIn, checkOut, roomTypeId) => {
    try {
      const response = await api.post("/bookings/search", {
        check_in: checkIn,
        check_out: checkOut,
        room_type_id: roomTypeId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tìm kiếm phòng trống";
    }
  },
  getRoomTypeById: async (id) => {
    try {
      const response = await api.get(`/room-types/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi khi lấy thông tin phòng";
    }
  },
  getRooms: async () => {
    try {
      const response = await api.get("/rooms");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải sơ đồ phòng";
    }
  },

  updateRoomStatus: async (id, status) => {
    try {
      const response = await api.patch(`/rooms/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi cập nhật trạng thái";
    }
  },
  updateRoom: async (id, data) => {
    try {
      const response = await api.put(`rooms/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi cập nhật phòng";
    }
  },
  deleteRoom: async (id) => {
    try {
      const response = await api.delete(`/rooms/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi xóa phòng";
    }
  },
  createRoom: async (data) => {
    try {
      const response = await api.post("/rooms", data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tạo phòng";
    }
  },
};

export default RoomService;
