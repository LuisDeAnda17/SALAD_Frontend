export interface GetCompletedPartsRequest {
  user: string
  challenge: string
}

interface CompletedPart {
  part: string
  day: number
  week: number
}

export type GetCompletedPartsResponse = CompletedPart[]

export interface GetPartsRequest {
  challenge: string
}

interface Part {
  part: string
  day: number
  week: number
}

export type GetPartsResponse = Part[]

export interface GetPartDayWeekRequest {
  parts: Array<string>
}

interface PartDayWeek {
  part: string
  day: number
  week: number
}

export type GetPartDayWeekResponse = PartDayWeek[]
