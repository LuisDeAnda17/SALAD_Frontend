// API Types based on the API specification

export interface User {
  _id: string
  username: string
}

// UserAuthentication Types

export interface UploadUserRequest {
  username: string
  password: string
}

export interface UploadUserResponse {
  user: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: string
  session: string
}

export interface LogoutRequest {
  session: string
}

// Error Response
export interface ErrorResponse {
  error: string
}

export interface GetUsernameRequest {
  user: string
}

export interface GetUsernameResponse {
  username: string
}
