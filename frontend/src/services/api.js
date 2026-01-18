import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');

// Mood
export const logMood = (data) => API.post('/mood/log', data);
export const getMoodHistory = () => API.get('/mood/history');

// Medical
export const analyzeMedicalImage = (formData) => API.post('/medical/analyze', formData);
export const getMedicalHistory = () => API.get('/medical/history');

// Workout
export const generateWorkout = (data) => API.post('/workout/generate', data);
export const completeWorkout = (id) => API.post(`/workout/complete/${id}`);
export const logActivity = (data) => API.post('/workout/activity', data);
export const getActivityHistory = () => API.get('/workout/activity/history');
export const getWorkoutHistory = () => API.get('/workout/history');

// Personality
export const submitQuiz = (data) => API.post('/personality/submit', data);

export default API;