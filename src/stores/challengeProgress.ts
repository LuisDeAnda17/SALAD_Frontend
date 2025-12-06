import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/api'
import { challengeProgressApi } from '@/services/api/challengeProgressApi'

export const useChallengeProgressStore = defineStore('challengeProgress', () => {
  async function _getCompletedParts(user: string, challenge: string) {
    try {
      const response = await challengeProgressApi._getCompletedParts({ user, challenge })
      return response.data
    } catch (error) {
      console.error('_getCompletedParts failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function _getParts(challenge: string) {
    try {
      const response = await challengeProgressApi._getParts({ challenge })
      return response.data
    } catch (error) {
      console.error('_getParts failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function _getPartDayWeek(parts: Array<string>) {
    try {
      const response = await challengeProgressApi._getPartDayWeek({ parts })
      return response.data
    } catch (error) {
      console.error('_getPartDayWeek failed:', error)
      return { status: 'failed', error: error }
    }
  }

  return {
    //State
    //Actions
    _getCompletedParts,
    _getParts,
    _getPartDayWeek,
  }
})
