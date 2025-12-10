import type { 
    ErrorResponse,
    getUserpointsRequest, 
    getUserpointsResponse,
    getUserRankingsResponse, 
    getUserRankingsRequest,
    getGroupRankingsRequest, 
    getGroupRankingsResponse, 
    getGrouppointsRequest,
    getGrouppointsResponse,
} from "@/types/leaderboard";
import type { AxiosResponse } from "axios";
import { http } from "./http";

export class LeaderboardApi {
    async getUserPoints(request: getUserpointsRequest): Promise<AxiosResponse<getUserpointsResponse>> {
        return http.post('/Leaderboard/_getUserPoints', request);
    }

    async getGroupPoints(request: getGrouppointsRequest): Promise<AxiosResponse<getGrouppointsResponse>> {
        return http.post('/Leaderboard/_getGroupPoints', request);
    }

    async getUserRankings(request: getUserRankingsRequest): Promise<AxiosResponse<getUserRankingsResponse>> {
        return http.post('/Leaderboard/_getUserRanking', request);
    }

    async getGroupRankings(request: getGroupRankingsRequest): Promise<AxiosResponse<getGroupRankingsResponse>> {
        return http.post('/Leaderboard/_getGroupRanking', request);
    }   
}

export const leaderboardApi = new LeaderboardApi()

