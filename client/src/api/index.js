import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

const API = axios.create({
  baseURL,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

export const getSavedHelpers = () => API.get("/auth/saved-helpers");
export const toggleSavedHelper = (helperId) =>
  API.post("/auth/saved-helpers/toggle", { helperId });

export const getHelpers = (params) => API.get("/helpers", { params });
export const getHelper = (id) => API.get(`/helpers/${id}`);
export const addHelper = (data) => API.post("/helpers", data);
export const updateHelper = (id, data) => API.put(`/helpers/${id}`, data);
export const deleteHelper = (id) => API.delete(`/helpers/${id}`);
export const getMyHelperProfile = () => API.get("/helpers/me/profile");

export const createBooking = (data) => API.post("/bookings", data);
export const getMyBookings = () => API.get("/bookings/mine");
export const getHelperRequests = () => API.get("/bookings/helper-requests");
export const updateBookingStatus = (id, status) =>
  API.patch(`/bookings/${id}/status`, { status });
export const sendBookingMessage = (id, text) =>
  API.post(`/bookings/${id}/messages`, { text });
export const requestBookingCall = (id, note) =>
  API.post(`/bookings/${id}/call-requests`, { note });
export const updateBookingCall = (id, callId, status) =>
  API.patch(`/bookings/${id}/call-requests/${callId}`, { status });
export const addBookingAttendance = (id, data) =>
  API.post(`/bookings/${id}/attendance`, data);
export const addBookingPayment = (id, data) =>
  API.post(`/bookings/${id}/payments`, data);
export const addBookingWeeklyReview = (id, data) =>
  API.post(`/bookings/${id}/weekly-reviews`, data);

export const getCallToken = () => API.get("/calls/token");

export const submitRating = (helperId, rating, review) =>
  API.post("/ratings", { helperId, rating, review });
export const getHelperRatings = (helperId) => API.get(`/ratings/${helperId}`);
export const getMyRating = (helperId) => API.get(`/ratings/${helperId}/mine`);

export const getAdminOverview = () => API.get("/admin/overview");
export const reviewHelperProfile = (helperId, payload) =>
  API.patch(`/admin/helpers/${helperId}/review`, payload);

export default API;
