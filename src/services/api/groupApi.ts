<<<<<<< HEAD
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
    return http.post("/Group/create", request);
  }
=======
// create(leader: User, name: string, private: boolean): (group: Group)
>>>>>>> 4083e0487c8f077f2e0e2a93c6bd1d96cdb541fe

  async request(request: RequestGroupRequest): Promise<AxiosResponse<RequestGroupResponse>> {
    return http.post("/Group/request", request);
  }

  async accept(request: AcceptGroupRequest): Promise<AxiosResponse<void>> {
    return http.post("/Group/accept", request);
  }

  async deny(request: DenyGroupRequest): Promise<AxiosResponse<void>> {
    return http.post("/Group/deny", request);
  }

  async removeMember(request: RemoveMemberRequest): Promise<AxiosResponse<void>> {
    return http.post("/Group/removeMember", request);
  }

  async deleteGroup(request: DeleteGroupRequest): Promise<AxiosResponse<void>> {
    return http.post("/Group/deleteGroup", request);
  }

  async getGroups(request: GetGroupsRequest): Promise<AxiosResponse<GetGroupsResponse>> {
    return http.post("/Group/getGroups", request);
  }

  async getMembers(request: GetMembersRequest): Promise<AxiosResponse<GetMembersResponse>> {
    return http.post("/Group/getMembers", request);
  }

  async getLeader(request: GetLeaderRequest): Promise<AxiosResponse<GetLeaderResponse>> {
    return http.post("/Group/getLeader", request);
  }

  async getName(request: GetNameRequest): Promise<AxiosResponse<GetNameResponse>> {
    return http.post("/Group/getName", request);
  }

  async isPrivate(request: IsPrivateRequest): Promise<AxiosResponse<IsPrivateResponse>> {
    return http.post("/Group/isPrivate", request);
  }

  async getPublicGroups(): Promise<AxiosResponse<GetPublicGroupsResponse>> {
    return http.post("/Group/getPublicGroups");
  }

  async getGroupRequests(request: GetGroupRequestsRequest): Promise<AxiosResponse<GetGroupRequestsResponse>> {
    return http.post("/Group/getGroupRequests", request);
  }

  async getUserRequests(request: GetUserRequestsRequest): Promise<AxiosResponse<GetUserRequestsResponse>> {
    return http.post("/Group/getUserRequests", request);
  }

  async getRequestDetails(request: GetRequestDetailsRequest): Promise<AxiosResponse<GetRequestDetailsResponse>> {
    return http.post("/Group/getRequestDetails", request);
  }
}


export const groupApi = new GroupApi()
