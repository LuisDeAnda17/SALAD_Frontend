import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/api'
import { leaderboardApi } from '@/services/api/LeaderboardApi'
import { useAuthStore } from '@/stores/auth';

export const useleaderboardStore = defineStore('leaderboard', () => {
    async function _fetchUserPoints(userId: string) {
        try {
            const response = await leaderboardApi.getUserPoints({ user: userId }); 
            return response.data.points;
        } catch (error) {
            console.error('Failed to fetch user points:', error);
            return null;
        }
    }

    async function _fetchUserRankings(userIds: string[]) {
        try {
            const response = await leaderboardApi.getUserRankings({ users: userIds });
            if('error' in (response.data as any)) {
                console.log('Error in response:', (response.data as any).error);
                return [];
            }
            console.log('User rankings response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch user rankings:', error);
            return [];
        }
    }

    return {
        //Queries
        _fetchUserPoints,
        _fetchUserRankings,
    }
})
