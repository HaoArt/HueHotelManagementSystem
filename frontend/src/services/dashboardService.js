import api from './api';

const DashboardService = {
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Lỗi tải thống kê hệ thống';
    }
  }
};

export default DashboardService;