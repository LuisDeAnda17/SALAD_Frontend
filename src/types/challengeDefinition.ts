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

export type ExerciseInfo = AnaerobicInfo | RepAerobicInfo | DistanceAerobicInfo

export interface CreateChallengeRequest {
  session: string
  exercise: string
  daysPerWeek: number
  weeks: number
  level: number
  info: ExerciseInfo
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

export interface IsOpenRequest {
  challenge: string
}

interface IsOpen {
  isOpen: boolean
}

export type IsOpenResponse = IsOpen[]

export interface GetChallengeDetailsRequest {
  challenge: string
}

interface ChallengeDetails {
  exercise: string
  level: number
  daysPerWeek: number
  weeks: number
  info: AnaerobicInfo | RepAerobicInfo | DistanceAerobicInfo
}

export type GetChallengeDetailsResponse = ChallengeDetails[]

export interface GetCreatorRequest {
  challenge: string
}

interface Creator {
  creator: string
}

export type GetCreatorResponse = Creator[]

export interface GetPartPointsRequest {
  challenge: string
}

interface Points {
  points: string
}

export type GetPartPointsResponse = Points[]

export interface GetBonusPointsRequest {
  challenge: string
}

export type GetBonusPointsResponse = Points[]

export type GetCreatedChallengesRequest = { user: string }

interface Challenge {
  challenge: string
}

export type GetCreatedChallengesResponse = Challenge[]
