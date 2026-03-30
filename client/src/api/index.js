import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const signup         = (data)   => API.post("/auth/signup",       data);
export const login          = (data)   => API.post("/auth/login",        data);
export const googleAuth     = (data)   => API.post("/auth/google",       data);
export const getMe          = ()       => API.get("/auth/me");
export const getHelpers     = (params) => API.get("/helpers",            { params });
export const getMyHelperProfile = ()     => API.get("/helpers/me/profile");
export const getHelper      = (id)     => API.get(`/helpers/${id}`);
export const addHelper      = (data)   => API.post("/helpers",           data);
export const createBooking  = (data)   => API.post("/bookings",          data);
export const getMyBookings  = ()       => API.get("/bookings/mine");
export const getHelperRequests = ()     => API.get("/bookings/helper-requests");
export const updateBookingStatus = (id, data) =>
  API.patch(`/bookings/${id}/status`, data);

export default API;
