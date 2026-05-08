import api from "./api";

const UserService = {
  getProfile: async () => {
    try {
      const response = await api.get("/users/profile");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải thông tin cá nhân";
    }
  },
  updateProfile: async (data) => {
    try {
      const response = await api.put("/users/profile", data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi cập nhật thông tin";
    }
  },
  getAllCustomers: async () => {
    try {
      const response = await api.get("/users/admin/customers");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi tải danh sách khách hàng";
    }
  },
  updateCustomerStatus: async (id, status) => {
    try {
      const response = await api.patch(`/users/admin/customers/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi cập nhật trạng thái";
    }
  },
  resetCustomerPassword: async (id) => {
    try {
      const response = await api.post(`/users/admin/reset-password/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi khi cấp lại mật khẩu";
    }
  },
};

export default UserService;
