import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/api'
import type { ExerciseInfo } from '@/types/challengeDefinition'
import { challengeDefinitionApi } from '@/services/api/challengeDefinitionApi'

export const useChallengeDefinitionStore = defineStore('challengeDefinition', () => {
  async function createChallenge(
    session: string,
    exercise: string,
    daysOfWeek: number,
    weeks: number,
    level: number,
    info: ExerciseInfo,
  ) {
    try {
      const response = await challengeDefinitionApi.createChallenge({
        session,
        exercise,
        daysOfWeek,
        weeks,
        level,
        info,
      })
      return response.data
    } catch (error) {
      console.error('createChallenge failed:', error)
      return error
    }
  }

  async function openChallenge(session: string, challenge: string) {
    try {
      const response = await challengeDefinitionApi.openChallenge({ session, challenge })
      return response.data
    } catch (error) {
      console.error('openChallenge failed:', error)
      return error
    }
  }

  async function deleteChallenge(session: string, challenge: string) {
    try {
      const response = await challengeDefinitionApi.deleteChallenge({ session, challenge })
      return response.data
    } catch (error) {
      console.error('deleteChallenge failed:', error)
      return error
    }
  }

  async function closeChallenge(session: string, challenge: string) {
    try {
      const response = await challengeDefinitionApi.closeChallenge({ session, challenge })
      return response.data
    } catch (error) {
      console.error('closeChallenge failed:', error)
      return error
    }
  }

  async function _getCreatedChallenges(user: string) {
    try {
      const response = await challengeDefinitionApi._getCreatedChallenges({ user })
      return response.data
    } catch (error) {
      console.error('_getCreatedChallenges failed:', error)
      return error
    }
  }

  return {
    //State
    //Actions
    closeChallenge,
    deleteChallenge,
    createChallenge,
    openChallenge,
    _getCreatedChallenges,
  }
})
