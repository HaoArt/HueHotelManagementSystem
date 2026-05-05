import api from "./api";

const ContactService = {
  submitContact: async (data) => {
    try {
      const response = await api.post("/contacts", data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi gửi liên hệ";
    }
  },
  getAllContacts: async () => {
    try {
      const response = await api.get("/contacts");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải liên hệ";
    }
  },
  replyContact: async (id, message) => {
    try {
      const response = await api.post(`/contacts/${id}/reply`, {
        replyMessage: message,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi gửi phản hồi";
    }
  },
  deleteContact: async (id) => {
    try {
      const response = await api.delete(`/contacts/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi xóa liên hệ";
    }
  },
};

export default ContactService;
