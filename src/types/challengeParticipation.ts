export interface CreateInvitationRequest {
  session: string
  challenge: string
  user: string
}

export interface CreateInvitationResponse {
  invitation: string
  status: string
}

export interface AcceptInvitationRequest {
  session: string
  invitation: string
}

export interface AcceptInvitationResponse {
  participation: string
  status: string
}

export interface RemoveInvitationRequest {
  session: string
  invitation: string
}

export interface RemoveInvitationResponse {
  status: string
}

export interface RemoveParticipationRequest {
  session: string
  participation: string
}

export interface RemoveParticipationResponse {
  status: string
}

export interface GetUserParticipationsRequest {
  user: string
}

export interface UserParticipation {
  participation: string
  challenge: string
}

export type GetUserParticipationsResponse = UserParticipation[]

export interface GetUserInvitationsRequest {
  user: string
}

export interface UserInvitation {
  invitation: string
  challenge: string
}

export type GetUserInvitationsResponse = UserInvitation[]

export interface GetChallengeInvitationsRequest {
  challenge: string
}

export interface ChallengeInvitation {
  invitation: string
  user: string
}

export type GetChallengeInvitationsResponse = ChallengeInvitation[]

export interface GetChallengeParticipationsRequest {
  challenge: string
}

export interface ChallengeParticipation {
  participation: string
  user: string
}

export type GetChallengeParticipationsResponse = ChallengeParticipation[]

export interface GetInvitationRequest {
  user: string
  challenge: string
}

interface Invitation {
  invitation: string
}

export type GetInvitationResponse = Invitation[]

export interface GetParticipationRequest {
  user: string
  challenge: string
}

interface Participation {
  participation: string
}

export type GetParticipationResponse = Participation[]
