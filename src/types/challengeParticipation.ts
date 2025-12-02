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
