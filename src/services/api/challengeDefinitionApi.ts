import type { AxiosResponse } from 'axios'
import { http } from './http'
import type {
  CreateChallengeRequest,
  CreateChallengeResponse,
  DeleteChallengeRequest,
  DeleteChallengeResponse,
  OpenChallengeRequest,
  OpenChallengeResponse,
  CloseChallengeRequest,
  CloseChallengeResponse,
} from '@/types/challengeDefinition'

export class ChallengeDefinitionApi {
  async createChallenge(
    request: CreateChallengeRequest,
  ): Promise<AxiosResponse<CreateChallengeResponse>> {
    return http.post('/createChallenge', request)
  }

  async deleteChallenge(
    request: DeleteChallengeRequest,
  ): Promise<AxiosResponse<DeleteChallengeResponse>> {
    return http.post('/deleteChallenge', request)
  }

  async openChallenge(
    request: OpenChallengeRequest,
  ): Promise<AxiosResponse<OpenChallengeResponse>> {
    return http.post('/openChallenge', request)
  }

  async closeChallenge(
    request: CloseChallengeRequest,
  ): Promise<AxiosResponse<CloseChallengeResponse>> {
    return http.post('/closeChallenge', request)
  }
}

export const challengeDefinitionApi = new ChallengeDefinitionApi()
