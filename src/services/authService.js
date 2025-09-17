import API from '../api/axiosInstance';

export async function login(email, password) {
  const res = await API.post('/api/auth/login', { email, password });
  return res.data;
}
