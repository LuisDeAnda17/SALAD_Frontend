export interface CreateVerificationRequest {
  session: string
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
