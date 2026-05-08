import api from "./api";

const SurchargeService = {
  getAll: async () => {
    const response = await api.get("/surcharges");
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/surcharges", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/surcharges/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/surcharges/${id}`);
    return response.data;
  },
};

export default SurchargeService;
