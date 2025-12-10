import type { AxiosResponse } from 'axios'
import { http } from './http'
import type {
    ProfileResponse,
    ProfileRequest,
    UpdateProfileRequest,
} from '../../types/profile'

export class ProfileApi {
    async getProfile(request : ProfileRequest): Promise<AxiosResponse<ProfileResponse>> {
        return http.post<ProfileResponse>('/UserProfile/_getProfile', request )
    }
    async updateProfile(request : UpdateProfileRequest): Promise<AxiosResponse<void>> {
        return http.post<void>('/editProfile', request )
    }
}


export const profileApi = new ProfileApi()