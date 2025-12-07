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
  IsOpenResponse,
  IsOpenRequest,
  GetChallengeDetailsRequest,
  GetChallengeDetailsResponse,
  GetCreatorRequest,
  GetCreatorResponse,
  GetBonusPointsRequest,
  GetBonusPointsResponse,
  GetPartPointsRequest,
  GetPartPointsResponse,
  GetCreatedChallengesRequest,
  GetCreatedChallengesResponse,
  GetChallengeNameRequest,
  GetChallengeNameResponse,
  GetDateCreatedRequest,
  GetDateCreatedResponse,
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

  async _isOpen(request: IsOpenRequest): Promise<AxiosResponse<IsOpenResponse>> {
    return http.post('/ChallengeDefinition/_isOpen', request)
  }

  async _getChallengeDetails(
    request: GetChallengeDetailsRequest,
  ): Promise<AxiosResponse<GetChallengeDetailsResponse>> {
    return http.post('/ChallengeDefinition/_getChallengeDetails', request)
  }

  async _getCreator(request: GetCreatorRequest): Promise<AxiosResponse<GetCreatorResponse>> {
    return http.post('/ChallengeDefinition/_getCreator', request)
  }

  async _getChallengeName(
    request: GetChallengeNameRequest,
  ): Promise<AxiosResponse<GetChallengeNameResponse>> {
    return http.post('/ChallengeDefinition/_getChallengeName', request)
  }

  async _getDateCreated(
    request: GetDateCreatedRequest,
  ): Promise<AxiosResponse<GetDateCreatedResponse>> {
    return http.post('/ChallengeDefinition/_getDateCreated', request)
  }

  async _getPartPoints(
    request: GetPartPointsRequest,
  ): Promise<AxiosResponse<GetPartPointsResponse>> {
    return http.post('/ChallengeDefinition/_getPartPoints', request)
  }

  async _getBonusPoints(
    request: GetBonusPointsRequest,
  ): Promise<AxiosResponse<GetBonusPointsResponse>> {
    return http.post('/ChallengeDefinition/_getBonusPoints', request)
  }

  async _getCreatedChallenges(
    request: GetCreatedChallengesRequest,
  ): Promise<AxiosResponse<GetCreatedChallengesResponse>> {
    return http.post('/ChallengeDefinition/_getCreatedChallenges', request)
  }
}

export const challengeDefinitionApi = new ChallengeDefinitionApi()
