import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const signup      = (data)   => API.post("/auth/signup", data);
export const login       = (data)   => API.post("/auth/login",  data);
export const getHelpers  = (params) => API.get("/helpers",      { params });
export const getHelper   = (id)     => API.get(`/helpers/${id}`);
export const addHelper   = (data)   => API.post("/helpers",     data);
export const createBooking = (data) => API.post("/bookings",    data);
export const getMyBookings = ()     => API.get("/bookings/mine");

export default API;
