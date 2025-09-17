import API from '../api/axiosInstance';
export const submit = (data) => API.post('/api/submissions', data);
export const mySubmission = (assignmentId) => API.get(`/api/submissions/my/${assignmentId}`);
export const listForTeacher = (assignmentId) => API.get(`/api/submissions/${assignmentId}`);
