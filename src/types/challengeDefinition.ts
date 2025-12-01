export type AnaerobicInfo = {
  _type: 'AnaerobicInfo'
  weight?: number //kg
  sets: number
  reps: number
}

export type RepAerobicInfo = {
  _type: 'RepAerobicInfo'
  repSpeed: number //reps per minute
  minutes: number
}

export type DistanceAerobicInfo = {
  _type: 'DistanceAerobicInfo'
  distanceSpeed: number //km per hour
  minutes: number
}

export interface CreateChallengeRequest {
  session: string
  exercise: string
  daysOfWeek: number
  weeks: number
  level: number
  info: AnaerobicInfo | RepAerobicInfo | DistanceAerobicInfo
}

export interface CreateChallengeResponse {
  challenge: string
  status: string
}

export interface DeleteChallengeRequest {
  session: string
  challenge: string
}

export interface DeleteChallengeResponse {
  status: string
}

export interface OpenChallengeRequest {
  session: string
  challenge: string
}

export interface OpenChallengeResponse {
  status: string
}

export interface CloseChallengeRequest {
  session: string
  challenge: string
}

export interface CloseChallengeResponse {
  status: string
}
