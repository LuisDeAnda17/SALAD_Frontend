import type { LoginRequest, LoginResponse, UploadUserRequest, UploadUserResponse, GetUsername, GetUsernameResponse, GetAllUsersResponse, LogoutRequest} from "@/types/api";
import type { AxiosResponse } from "axios";
import { http } from "./http";

export class AuthApi {
  async login(request: LoginRequest): Promise<AxiosResponse<LoginResponse>> {
    return http.post("/login", request);
  }

  async register(request: UploadUserRequest): Promise<AxiosResponse<UploadUserResponse>> {
    return http.post("/UserAuthentication/uploadUser", request);
  }

  async getUsername(request: GetUsername): Promise<AxiosResponse<GetUsernameResponse[]>> {
    return http.post("/UserAuthentication/_getUsername", request);
  }

  async getAllUsers(): Promise<AxiosResponse<GetAllUsersResponse[]>> {
    return http.post("/UserAuthentication/_getAllUsers");
  }

  async logout(request: LogoutRequest): Promise<AxiosResponse<void>> {
    return http.post("/logout", request);
  }
}

export const authApi = new AuthApi();
