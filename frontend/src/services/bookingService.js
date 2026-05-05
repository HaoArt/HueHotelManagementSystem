/* eslint-disable no-unused-vars */
import api from "./api"; // Axios instance của bạn

const BookingService = {
  createBooking: async (data) => {
    try {
      const response = await api.post("/bookings/create", data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi khi tạo đơn đặt phòng";
    }
  },
  getUserBookings: async () => {
    try {
      const response = await api.get("/bookings/my-bookings");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải lịch sử đặt phòng";
    }
  },
  addReview: async (bookingId, reviewData) => {
    try {
      const response = await api.post(
        `/bookings/${bookingId}/review`,
        reviewData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi khi gửi đánh giá";
    }
  },
  getAllBookingsAdmin: async () => {
    try {
      const response = await api.get("/bookings/admin/all");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải danh sách đơn cho Admin";
    }
  },
  createWalkInBooking: async (data) => {
    try {
      const response = await api.post("/bookings/walk-in", data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tạo đơn Walk-in";
    }
  },

  confirmDeposit: async (id) => {
    try {
      const response = await api.put(`/bookings/${id}/confirm`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi xác nhận tiền cọc";
    }
  },

  checkInBooking: async (id) => {
    try {
      const response = await api.patch(`/bookings/check-in/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi khi Check-in";
    }
  },
  checkOutBooking: async (id) => {
    try {
      const response = await api.patch(`/bookings/check-out/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi khi Check-out";
    }
  },
  cancelBooking: async (id) => {
    try {
      const response = await api.patch(`/bookings/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi khi hủy đơn";
    }
  },

  getCurrentBookingByRoomId: async (roomId) => {
    try {
      const response = await api.get(`/bookings/current/room/${roomId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải thông tin khách đang ở";
    }
  },
  changeRoom: async (bookingId, idNewRoom) => {
    try {
      const response = await api.put(`/bookings/change-room/${bookingId}`, {
        idNewRoom,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi khi đổi phòng";
    }
  },

  downloadInvoice: async (id) => {
    try {
      const response = await api.get(`/bookings/${id}/invoice`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      throw "Lỗi khi tải xuống hóa đơn PDF";
    }
  },
};

export default BookingService;
