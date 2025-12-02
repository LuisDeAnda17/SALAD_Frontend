import type { AxiosResponse } from 'axios'
import { http } from './http'
import type {
  CreateInvitationRequest,
  CreateInvitationResponse,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  RemoveInvitationRequest,
  RemoveInvitationResponse,
  RemoveParticipationRequest,
  RemoveParticipationResponse,
  GetUserInvitationsRequest,
  GetUserParticipationsRequest,
  GetUserInvitationsResponse,
  GetUserParticipationsResponse,
} from '@/types/challengeParticipation'

export class ChallengeParticipationApi {
  async createInvitation(
    request: CreateInvitationRequest,
  ): Promise<AxiosResponse<CreateInvitationResponse>> {
    return http.post('/createInvitation', request)
  }

  async acceptInvitation(
    request: AcceptInvitationRequest,
  ): Promise<AxiosResponse<AcceptInvitationResponse>> {
    return http.post('/acceptInvitation', request)
  }

  async removeInvitation(
    request: RemoveInvitationRequest,
  ): Promise<AxiosResponse<RemoveInvitationResponse>> {
    return http.post('/removeInvitation', request)
  }

  async removeParticipation(
    request: RemoveParticipationRequest,
  ): Promise<AxiosResponse<RemoveParticipationResponse>> {
    return http.post('/removeParticipation', request)
  }

  async _getUserInvitations(
    request: GetUserInvitationsRequest,
  ): Promise<AxiosResponse<GetUserInvitationsResponse>> {
    return http.post('/ChallengeParticipation/_getUserInvitations', request)
  }

  async _getUserParticipations(
    request: GetUserParticipationsRequest,
  ): Promise<AxiosResponse<GetUserParticipationsResponse>> {
    return http.post('/ChallengeParticipation/_getUserParticipations', request)
  }
}

export const challengeParticipationApi = new ChallengeParticipationApi()
