
export interface CreateRequest {
    session: string,
    leader: string, 
    name: string, 
    privateGroup: boolean
}

export interface CreateResponse {
    group: string
}

export interface RequestGroupRequest {
    session: string,
    user: string,
    group: string
}

export interface RequestGroupResponse {
    membershipRequest: string
}

export interface AcceptGroupRequest {
    session: string,
    membershipRequest: string
}

export interface DenyGroupRequest {
    session: string,
    membershipRequest: string
}

export interface RemoveMemberRequest {
    session: string,
    user: string,
    group: string
}

export interface DeleteGroupRequest {
    session: string,
    group: string
}

export interface GetGroupsRequest {
    user: string
}

export type GetGroupsResponse =
   {group: string; name: string; leader: string}[];

export interface GetMembersRequest {
    group: string
}

export type GetMembersResponse = 
     string[]


export interface GetLeaderRequest {
    group: string
}

export type GetLeaderResponse = {
    leader: string
}[];

export interface GetNameRequest {
    group: string
}

export type GetNameResponse = {
    name: string
}[];

export interface IsPrivateRequest {
    group: string
}

export type IsPrivateResponse = {
    isPrivate: boolean
}[]

export type GetPublicGroupsResponse = 
    {group: string; name: string; leader: string}[]



export interface GetGroupRequestsRequest {
    group: string;
}

export type GetGroupRequestsResponse = {
        membershipRequest: string;
        requester: string; 
    }[];


export interface GetUserRequestsRequest {
    user: string;
}

export type GetUserRequestsResponse =
    {
        membershipRequest: string;
        group: string;
    }[];


export interface GetRequestDetailsRequest {
    membershipRequest: string;
}

export type GetRequestDetailsResponse = 
    {
        user: string;
        group: string;
    }[];
