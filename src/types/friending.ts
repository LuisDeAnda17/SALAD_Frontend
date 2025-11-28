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