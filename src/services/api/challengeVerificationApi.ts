import type { AxiosResponse } from 'axios'
import { http } from './http'
import type {
  CreateVerificationRequest,
  CreateVerificationResponse,
  RemoveVerificationRequest,
  RemoveVerificationResponse,
  VerifyRequest,
  VerifyResponse,
  GetRequesterActiveRequest,
  GetRequesterActiveResponse,
} from '@/types/challengeVerification'
export class ChallengeVerificationApi {
  async createVerificationRequest(
    request: CreateVerificationRequest,
  ): Promise<AxiosResponse<CreateVerificationResponse>> {
    return http.post('/createVerificationRequest', request)
  }

  async removeVerificationRequest(
    request: RemoveVerificationRequest,
  ): Promise<AxiosResponse<RemoveVerificationResponse>> {
    return http.post('/removeVerificationRequest', request)
  }

  async verify(request: VerifyRequest): Promise<AxiosResponse<VerifyResponse>> {
    return http.post('/verifyRequest', request)
  }

  async _getRequesterActiveRequests(
    request: GetRequesterActiveRequest,
  ): Promise<AxiosResponse<GetRequesterActiveResponse>> {
    return http.post('/ChallengeVerification/_getRequesterActiveRequests', request)
  }
}

export const challengeVerificationApi = new ChallengeVerificationApi()
