import type {
  RequestFriendRequest,
  RequestFriendResponse,
  AcceptFriendRequest,
  RemoveFriendRequest,
  ErrorResponse,
  Empty,
  GetFriendsAndRequestsRequest,
  GetFriendsResponse,
  GetFriendRequestsResponse,
  GetFriendRequestInfoRequest,
  GetFriendRequestInfoResponse,
} from "@/types/friending";
import type { AxiosResponse } from "axios";
import { http } from "./http";

export class FriendingApi {
  async requestFriend(request: RequestFriendRequest): Promise<AxiosResponse<RequestFriendResponse|ErrorResponse>> {
    return http.post("/Friending/requestFriend", request);
  }

  async acceptFriend(request: AcceptFriendRequest): Promise<AxiosResponse<Empty|ErrorResponse>> {
    return http.post("/Friending/acceptFriend", request);
  }

  async removeFriend(request: RemoveFriendRequest): Promise<AxiosResponse<Empty|ErrorResponse>> {
    return http.post("/Friending/removeFriend", request);
  }

  async getFriends(request: GetFriendsAndRequestsRequest): Promise<AxiosResponse<GetFriendsResponse[]>> {
    return http.post("/Friending/_getFriends", request);
  }

  async getReceivedRequests(request: GetFriendsAndRequestsRequest): Promise<AxiosResponse<GetFriendRequestsResponse[]>> {
    return http.post("/Friending/_getReceivedFriendRequests", request);
  }

  async getSentRequests(request: GetFriendsAndRequestsRequest): Promise<AxiosResponse<GetFriendRequestsResponse[]>> {
    return http.post("/Friending/_getSentFriendRequests", request);
  }

  async getRequestInfo(request: GetFriendRequestInfoRequest): Promise<AxiosResponse<GetFriendRequestInfoResponse>> {
    return http.post("/Friending/_getRequestInfo", request);
  }
}

export const friendingApi = new FriendingApi();