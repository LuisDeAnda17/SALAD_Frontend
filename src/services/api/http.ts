import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// --- request interceptor ---
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  try {
    const sessionId = window?.localStorage?.getItem("sessionId");
    if (sessionId && config.method?.toLowerCase() === "post") {
      config.data = { ...(config.data || {}), session: sessionId };
    }
  } catch {}

  console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
  return config;
});

// --- response interceptor ---
http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
