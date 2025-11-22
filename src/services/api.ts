import axios, { Axios, type AxiosInstance, type AxiosResponse } from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

import type {
    LoginRequest,
    LoginResponse,
    UploadUserRequest,
    UploadUserResponse,
} from "../types/api";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      // baseURL: "/api",
      baseURL: API_BASE,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config: any) => {
        // Inject session id into every POST body if present
        try {
          const sessionId =
            typeof window !== "undefined"
              ? window.localStorage.getItem("sessionId")
              : null;
          if (sessionId && config.method?.toLowerCase() === "post") {
            const originalData =
              config.data && typeof config.data === "object" ? config.data : {};
            config.data = { ...originalData, session: sessionId };
          }
        } catch (_) {
          // no-op if localStorage is unavailable
        }
        console.log(
          `Making ${config.method?.toUpperCase()} request to ${config.url}`
        );
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  //API methods go here
  // User Authentication
  async login(request: LoginRequest): Promise<AxiosResponse<LoginResponse>> {
    const response: AxiosResponse<LoginResponse> = await this.api.post(
      "/UserAuthentication/login",
      request
    );
    return response;
  }

  async register(request: UploadUserRequest): Promise<AxiosResponse<UploadUserResponse>> {
    const response: AxiosResponse<UploadUserResponse> = await this.api.post(
      "/UserAuthentication/uploadUser",
      request
    );
    return response;
  }

}

export const apiService = new ApiService();