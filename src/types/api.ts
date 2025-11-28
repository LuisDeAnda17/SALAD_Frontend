// API Types based on the API specification

export interface User {
  _id: string;
  username: string;
}

// UserAuthentication Types

export interface UploadUserRequest {
  username: string;
  password: string;
}

export interface UploadUserResponse {
  user: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: string;
}

export interface GetUsername {
  user: string;
}

export interface GetUsernameResponse {
  username: string;
}

export interface GetUser {
  username: string;
}

export interface GetUserResponse {
  user: string;
}

export interface isUser {
  user: string;
}

export interface isUserResponse {
  isUser: boolean;
}

export interface GetAllUsersResponse {
  user: string;
}

// Error Response
export interface ErrorResponse {
  error: string;
}
