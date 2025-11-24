import type { LoginRequest, LoginResponse, UploadUserRequest, UploadUserResponse } from "@/types/api";
import type { AxiosResponse } from "axios";
import { http } from "./http";

export class AuthApi {
  async login(request: LoginRequest): Promise<AxiosResponse<LoginResponse>> {
    return http.post("/UserAuthentication/login", request);
  }

  async register(request: UploadUserRequest): Promise<AxiosResponse<UploadUserResponse>> {
    return http.post("/UserAuthentication/uploadUser", request);
  }
}

export const authApi = new AuthApi();
