import type { AxiosResponse } from 'axios'
import { http } from './http'
import type {
  GetCompletedPartsRequest,
  GetCompletedPartsResponse,
  GetPartsRequest,
  GetPartsResponse,
  GetPartDayWeekRequest,
  GetPartDayWeekResponse,
} from '@/types/challengeProgress'

export class ChallengeProgressApi {
  async _getParts(request: GetPartsRequest): Promise<AxiosResponse<GetPartsResponse>> {
    return http.post('/ChallengeProgress/_getParts', request)
  }
  async _getCompletedParts(
    request: GetCompletedPartsRequest,
  ): Promise<AxiosResponse<GetCompletedPartsResponse>> {
    return http.post('/ChallengeProgress/_getCompletedParts', request)
  }

  async _getPartDayWeek(
    request: GetPartDayWeekRequest,
  ): Promise<AxiosResponse<GetPartDayWeekResponse>> {
    return http.post('/ChallengeProgress/_getPartDayWeek', request)
  }
}

export const challengeProgressApi = new ChallengeProgressApi()
