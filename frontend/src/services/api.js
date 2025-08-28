import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const passengerAPI = {
  getAll: () => api.get('/passengers'),
  createBulk: (passengers) => api.post('/passengers/bulk', passengers),
};

export const invoiceAPI = {
  getAll: () => api.get('/invoices'),
  download: (pnr) => api.post(`/download/${pnr}`),
  parse: (pnr) => api.post(`/parse/${pnr}`),
  getHighValue: (amount = 10000) => api.get(`/invoices/high-value?amount=${amount}`),
  flagForReview: (invoiceId, flag) => api.put(`/invoices/${invoiceId}/flag?flag=${flag}`),
  seed: async (items) => {
    try {
      return await api.post('/invoices/seed', items);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404 || status === 405) {
        return await api.post('/seed', items);
      }
      throw err;
    }
  },
};

export const summaryAPI = {
  getSummary: () => api.get('/summary'),
};

export default api; 