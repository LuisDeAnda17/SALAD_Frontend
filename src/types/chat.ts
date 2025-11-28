// Chat Types

export interface SendRequest {
    sender: string
    receiver: string
    message: string
  }
  
export interface SendResponse {
dm: string
}

export interface StartChatRequest {
requester: string
receiver: string
}

export interface StartChatResponse {
    chat: string;
}

export interface DeleteChatRequest {
    chat: string;
    user: string;
}

export interface GetChatsRequest {
    userA: string;
    userB: string;
}

export interface GetChatsResponse {
    chat: string;
}

export interface GetDMsRequest {
    chat: string
}

export interface GetDMsResponse {
    dm: {
        id: string;
        message: string;
        sender: string;
        receiver: string;
        time: Date;
    };
}

export interface GetUsersChatsRequest {
    user: string;
}

export interface GetUsersChatsResponse {
    chat: string;
}

// Error Response
export interface ErrorResponse {
    error: string
}

export interface Empty {}
  