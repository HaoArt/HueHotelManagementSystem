// src/services/auditService.js
import api from "./api";

const AuditService = {
  getLogs: async () => {
    try {
     
      const response = await api.get("/audits");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi khi tải nhật ký hoạt động";
    }
  },
};

export default AuditService;
