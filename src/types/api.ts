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
    user: string;
    sessionId: string;
}

export interface LogoutRequest {
    session: string;
    user: string;
}

export interface GetUsername {
  user: string;
}

export interface GetUsernameResponse {
  username: string;
}

export interface GetAllUsersResponse {
  user: string;
}

// Error Response
export interface ErrorResponse {
  error: string
}
