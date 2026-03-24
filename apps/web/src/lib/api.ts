import axios from "axios";
import { getAccessToken } from "./auth-storage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handler – maps to sonner toast via custom event
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ?? error.message ?? "Something went wrong";
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("api:error", { detail: message }));
    }
    return Promise.reject(error);
  }
);
