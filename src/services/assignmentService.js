import API from '../api/axiosInstance';
export const list = (params) => API.get('/api/assignments', { params });
export const create = (data) => API.post('/api/assignments', data);
export const changeStatus = (id, status) => API.put(`/api/assignments/${id}/status`, { status });
