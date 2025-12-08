// API Types based on the API specification

export interface User {
  _id: string, //userid
  points: number,
}

export interface Group{
  _id: string, //groupid
  points: number,
}

// Leaderboard Types

export interface getUserpointsRequest {
  user: string
}

export interface getUserpointsResponse {
  points: number
} 

export interface getGrouppointsRequest {
    group: string
}

export interface getGrouppointsResponse {
    points: number  
}

//rankings

export interface getUserRankingsRequest {
  users: string[]
} 

export type getUserRankingsResponse = { user: string; points: number }[]


export interface getGroupRankingsRequest {
  groups: string[]
}

export type getGroupRankingsResponse = { group: string; points: number }[]


// Error Response
export interface ErrorResponse {
  error: string
}