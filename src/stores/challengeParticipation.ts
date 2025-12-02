import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/api'
import { challengeParticipationApi } from '@/services/api/challengeParticipationApi'

export const useChallengeParticipationStore = defineStore('challengeParticipation', () => {
  async function _getUserInvitations(user: string) {
    try {
      const response = await challengeParticipationApi._getUserInvitations({ user })
      return response.data
    } catch (error) {
      console.error('_getUserInvitations failed:', error)
      return error
    }
  }

  async function _getUserParticipations(user: string) {
    try {
      const response = await challengeParticipationApi._getUserParticipations({ user })
      return response.data
    } catch (error) {
      console.error('_getUserParticipations failed:', error)
      return error
    }
  }

  return {
    //State
    //Actions
    _getUserInvitations,
    _getUserParticipations,
  }
})
