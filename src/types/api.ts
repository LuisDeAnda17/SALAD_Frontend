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

// Friending Types
export interface RequestFriendRequest {
  requester: string;
  receiver: string;
}

export interface RequestFriendResponse {
  request: string;
}

export interface AcceptFriendRequest {
  user: string;
  request: string;
}

export interface RemoveFriendRequest {
  user: string;
  requester: string;
}

export interface GetFriendsAndRequestsRequest {
  user: string;
}

export interface GetFriendsResponse {
  friend: string;
}

export interface GetFriendRequestsResponse {
  _id: string;
  requester: string;
  receiver: string;
}

export interface GetFriendRequestInfoRequest{
  friendRequest: string;
}

export interface GetFriendRequestInfoResponse {
  requester: string;
  receiver: string;
}


// Error Response
export interface ErrorResponse {
  error: string;
}

// Empty
export interface Empty {}