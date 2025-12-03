import type {
  ErrorResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  UploadUserRequest,
  UploadUserResponse,
  GetUsernameRequest,
  GetUsernameResponse,
  GetUserRequest,
  GetUserResponse,
} from '@/types/api'
import type { AxiosResponse } from 'axios'
import { http } from './http'

export class AuthApi {
  async login(request: LoginRequest): Promise<AxiosResponse<LoginResponse>> {
    return http.post('/login', request)
  }

  async register(request: UploadUserRequest): Promise<AxiosResponse<UploadUserResponse>> {
    return http.post('/UserAuthentication/uploadUser', request)
  }

  async logout(request: LogoutRequest): Promise<AxiosResponse<void>> {
    return http.post('/logout', request)
  }

  async _getUsername(request: GetUsernameRequest): Promise<AxiosResponse<GetUsernameResponse>> {
    return http.post('/UserAuthentication/_getUsername', request)
  }

  async _getUser(request: GetUserRequest): Promise<AxiosResponse<GetUserResponse>> {
    return http.post('/UserAuthentication/_getUser', request)
  }
}

export const authApi = new AuthApi()
