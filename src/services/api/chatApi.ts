import type { SendRequest, SendResponse, StartChatRequest, StartChatResponse, DeleteChatRequest, GetChatsRequest, GetChatsResponse, GetDMsRequest, GetDMsResponse, GetUsersChatsRequest, GetUsersChatsResponse, ErrorResponse, Empty } from "@/types/chat";
import type { AxiosResponse } from "axios";
import { http } from "./http";

export class ChatApi {
  async startChat(request: StartChatRequest): Promise<AxiosResponse<StartChatResponse|ErrorResponse>> {
    return http.post("/ChatConcept/startChat", request);
  }

  async deleteChat(request: DeleteChatRequest): Promise<AxiosResponse<Empty|ErrorResponse>> {
    return http.post("/ChatConcept/deleteChat", request);
  }

  async sendChat(request: SendRequest): Promise<AxiosResponse<SendResponse|ErrorResponse>> {
    return http.post("/ChatConcept/send", request);
  }

  async getChats(request: GetChatsRequest): Promise<AxiosResponse<GetChatsResponse[]|ErrorResponse[]>> {
    return http.post("/ChatConcept/_getChatBetweenUsers", request);
  }

  async getDMs(request: GetDMsRequest): Promise<AxiosResponse<GetDMsResponse[]|ErrorResponse[]>> {
    return http.post("/ChatConcept/_getDMsInChat", request);
  }

  async getUsersChats(request: GetUsersChatsRequest): Promise<AxiosResponse<GetUsersChatsResponse[]|ErrorResponse[]>> {
    return http.post("/ChatConcept/_getAccessibleChatsForUser", request);
  }
}

export const chatApi = new ChatApi();
