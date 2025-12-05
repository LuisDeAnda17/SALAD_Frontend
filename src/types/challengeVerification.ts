export interface CreateVerificationRequest {
  session: string
  challenge: string
  part: string
  requester: string
  approver: string
  evidence: string
}

export interface CreateVerificationResponse {
  verificationRequest: string
  status: string
}

export interface RemoveVerificationRequest {
  session: string
  verificationRequest: string
}

export interface RemoveVerificationResponse {
  status: string
}

export interface VerifyRequest {
  session: string
  verificationRequest: string
}

export interface VerifyResponse {
  status: string
}

export interface GetRequesterActiveRequest {
  user: string
  challenge: string
}

interface RequesterActiveRequest {
  verificationRequest: string
  part: string
}

export type GetRequesterActiveResponse = RequesterActiveRequest[]

export interface GetRequestDetailsRequest {
  verificationRequest: string
}

interface RequestDetails {
  part: string
  evidence: string
  challenge: string
  approver: string
  requester: string
  approved: string
}

export type GetRequestDetailsResponse = RequestDetails[]
