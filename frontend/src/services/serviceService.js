import api from "./api";

const ServiceService = {
  getAllServices: async () => {
    try {
      const response = await api.get("/services");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải danh sách dịch vụ";
    }
  },

  addService: async (serviceData) => {
    try {
      const response = await api.post("/services", serviceData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi thêm dịch vụ";
    }
  },

  updateService: async (id, serviceData) => {
    try {
      const response = await api.put(`/services/${id}`, serviceData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi cập nhật dịch vụ";
    }
  },

  deleteService: async (id) => {
    try {
      const response = await api.delete(`/services/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi xóa dịch vụ";
    }
  },
};

export default ServiceService;
