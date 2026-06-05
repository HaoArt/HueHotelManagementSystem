import api from "./api";

const AuditService = {
  getLogs: async (page = 1, limit = 20, search = "") => {
    try {
      const response = await api.get(
        `/audits?page=${page}&limit=${limit}&search=${search}`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi khi tải nhật ký hoạt động";
    }
  },
};

export default AuditService;
