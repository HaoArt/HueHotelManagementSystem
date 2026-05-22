import api from "./api";

const AuthService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi đăng nhập";
    }
  },

  preRegister: async (userData) => {
    try {
      const response = await api.post("/auth/pre-register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi gửi yêu cầu đăng ký";
    }
  },

  verifyAndCreate: async (email, otp_code) => {
    try {
      const response = await api.post("/auth/verify-register", {
        email,
        otp_code,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Mã OTP không hợp lệ";
    }
  },


  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data?.message || "Lỗi gửi yêu cầu khôi phục mật khẩu"
      );
    }
  },

  verifyForgotPassword: async (data) => {
    try {
      // data bao gồm: email, otp_code, new_password
      const response = await api.post("/auth/verify-forgot-password", data);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn"
      );
    }
  },

  changePassword: async (data) => {
    try {
      const response = await api.post("/auth/change-password", data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi đổi mật khẩu";
    }
  },
};

export default AuthService;
