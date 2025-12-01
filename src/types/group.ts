
export interface CreateRequest {
    leader: string, 
    name: string, 
    private: boolean
}

export interface CreateResponse {
    group: string
}

export interface RequestGroupRequest {
    user: string,
    group: string
}

export interface RequestGroupResponse {
    membershipRequest: string
}

export interface AcceptGroupRequest {
    membershipRequest: string
}

export interface DenyGroupRequest {
    membershipRequest: string
}

export interface RemoveMemberRequest {
    user: string,
    group: string
}

export interface DeleteGroupRequest {
    group: string
}

export interface GetGroupsRequest {
    user: string
}

export interface GetGroupsResponse {
    groups: string[]
}

export interface GetMembersRequest {
    group: string
}

export interface GetMembersResponse {
    members: string[]
}

export interface GetLeaderRequest {
    group: string
}

export interface GetLeaderResponse {
    leader: string
}

export interface GetNameRequest {
    group: string
}

export interface GetNameResponse {
    name: string
}

export interface IsPrivateRequest {
    group: string
}

export interface IsPrivateResponse {
    isPrivate: boolean
}

export interface GetPublicGroupsResponse {
    groups: string[]
}


export interface GetGroupRequestsRequest {
    group: string;
}

export interface GetGroupRequestsResponse {
    requests: {
        membershipRequest: string;
        requester: string;
    }[];
}

export interface GetUserRequestsRequest {
    user: string;
}

export interface GetUserRequestsResponse {
    requests: {
        membershipRequest: string;
        group: string;
    }[];
}

export interface GetRequestDetailsRequest {
    membershipRequest: string;
}

export interface GetRequestDetailsResponse {
    details: {
        user: string;
        group: string;
    }[];
}