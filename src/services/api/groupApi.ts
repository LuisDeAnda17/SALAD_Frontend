import type { AxiosResponse } from "axios";
import { http } from "./http";
import type {
  CreateRequest,
  CreateResponse,
  RequestGroupRequest,
  RequestGroupResponse,
  AcceptGroupRequest,
  DenyGroupRequest,
  RemoveMemberRequest,
  DeleteGroupRequest,
  GetGroupsRequest,
  GetGroupsResponse,
  GetMembersRequest,
  GetMembersResponse,
  GetLeaderRequest,
  GetLeaderResponse,
  GetNameRequest,
  GetNameResponse,
  IsPrivateRequest,
  IsPrivateResponse,
  GetPublicGroupsResponse,
  GetGroupRequestsRequest,
  GetGroupRequestsResponse,
  GetUserRequestsRequest,
  GetUserRequestsResponse,
  GetRequestDetailsRequest,
  GetRequestDetailsResponse,
} from "@/types/group";

class GroupApi {
      async create(request: CreateRequest): Promise<AxiosResponse<CreateResponse>> {
    return http.post("/createGroup", request);
  }

  async request(request: RequestGroupRequest): Promise<AxiosResponse<RequestGroupResponse>> {
    return http.post("/requestMembership", request);
  }

  async accept(request: AcceptGroupRequest): Promise<AxiosResponse<void>> {
    return http.post("/acceptMembership", request);
  }

  async deny(request: DenyGroupRequest): Promise<AxiosResponse<void>> {
    return http.post("/denyMembership", request);
  }

  async removeMember(request: RemoveMemberRequest): Promise<AxiosResponse<void>> {
    return http.post("/removeMember", request);
  }

  async deleteGroup(request: DeleteGroupRequest): Promise<AxiosResponse<void>> {
    return http.post("/deleteGroup", request);
  }

  async getGroups(request: GetGroupsRequest): Promise<AxiosResponse<GetGroupsResponse>> {
    return http.post("/Group/_getGroups", request);
  }

  async getMembers(request: GetMembersRequest): Promise<AxiosResponse<GetMembersResponse>> {
    return http.post("/Group/_getMembers", request);
  }

  async getLeader(request: GetLeaderRequest): Promise<AxiosResponse<GetLeaderResponse>> {
    return http.post("/Group/_getLeader", request);
  }

  async getName(request: GetNameRequest): Promise<AxiosResponse<GetNameResponse>> {
    return http.post("/Group/_getName", request);
  }

  async isPrivate(request: IsPrivateRequest): Promise<AxiosResponse<IsPrivateResponse>> {
    return http.post("/Group/_isPrivate", request);
  }

  async getPublicGroups(): Promise<AxiosResponse<GetPublicGroupsResponse>> {
    return http.post("/Group/_getPublicGroups");
  }

  async getGroupRequests(request: GetGroupRequestsRequest): Promise<AxiosResponse<GetGroupRequestsResponse>> {
    return http.post("/Group/_getGroupRequests", request);
  }

  async getUserRequests(request: GetUserRequestsRequest): Promise<AxiosResponse<GetUserRequestsResponse>> {
    return http.post("/Group/_getUserRequests", request);
  }

  async getRequestDetails(request: GetRequestDetailsRequest): Promise<AxiosResponse<GetRequestDetailsResponse>> {
    return http.post("/Group/_getRequestDetails", request);
  }
}


export const groupApi = new GroupApi()
