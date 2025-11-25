import type { LoginRequest, LoginResponse, UploadUserRequest, UploadUserResponse, GetUsername, GetUser, isUser, GetUsernameResponse, GetUserResponse, isUserResponse, GetAllUsersResponse } from "@/types/api";
import type { AxiosResponse } from "axios";
import { http } from "./http";

export class AuthApi {
  async login(request: LoginRequest): Promise<AxiosResponse<LoginResponse>> {
    return http.post("/UserAuthentication/login", request);
  }

  async register(request: UploadUserRequest): Promise<AxiosResponse<UploadUserResponse>> {
    return http.post("/UserAuthentication/uploadUser", request);
  }

  async getUsername(request: GetUsername): Promise<AxiosResponse<GetUsernameResponse[]>> {
    return http.post("/UserAuthentication/_getUsername", request);
  }

  async getUser(request: GetUser): Promise<AxiosResponse<GetUserResponse[]>> {
    return http.post("/UserAuthentication/_getUser", request);
  }

  async isUser(request: isUser): Promise<AxiosResponse<isUserResponse[]>> {
    return http.post("/UserAuthentication/_isUser", request);
  }

  async getAllUsers(): Promise<AxiosResponse<GetAllUsersResponse[]>> {
    return http.post("/UserAuthentication/_getAllUsers");
  }
}

export const authApi = new AuthApi();
