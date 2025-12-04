import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/api'
import type { ExerciseInfo } from '@/types/challengeDefinition'
import { challengeDefinitionApi } from '@/services/api/challengeDefinitionApi'

export const useChallengeDefinitionStore = defineStore('challengeDefinition', () => {
  async function createChallenge(
    session: string,
    exercise: string,
    daysPerWeek: number,
    weeks: number,
    level: number,
    info: ExerciseInfo,
  ) {
    try {
      const response = await challengeDefinitionApi.createChallenge({
        session,
        exercise,
        daysPerWeek,
        weeks,
        level,
        info,
      })
      return response.data
    } catch (error) {
      console.error('createChallenge failed:', error)
      return { status: 'failed' }
    }
  }

  async function openChallenge(session: string, challenge: string) {
    try {
      const response = await challengeDefinitionApi.openChallenge({ session, challenge })
      console.log(`openChallenge failed: ${response}`)
      return response.data
    } catch (error) {
      console.error('openChallenge failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function deleteChallenge(session: string, challenge: string) {
    try {
      const response = await challengeDefinitionApi.deleteChallenge({ session, challenge })
      return response.data
    } catch (error) {
      console.error('deleteChallenge failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function closeChallenge(session: string, challenge: string) {
    try {
      const response = await challengeDefinitionApi.closeChallenge({ session, challenge })
      return response.data
    } catch (error) {
      console.error('closeChallenge failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function _getCreatedChallenges(user: string) {
    try {
      const response = await challengeDefinitionApi._getCreatedChallenges({ user })
      return response.data
    } catch (error) {
      console.error('_getCreatedChallenges failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function _getChallengeDetails(challenge: string) {
    try {
      const response = await challengeDefinitionApi._getChallengeDetails({ challenge })
      console.log(`_getChallengeDetails backend result: ${response}`)
      console.log('STRINGIFIED:', JSON.stringify(response, null, 2))
      return response.data
    } catch (error) {
      console.error('_getChallengeDetails failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function _getCreator(challenge: string) {
    try {
      const response = await challengeDefinitionApi._getCreator({ challenge })
      console.log(`_getCreator backend result: ${response}`)
      return response.data
    } catch (error) {
      console.error('_getCreator failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function _isOpen(challenge: string) {
    try {
      const response = await challengeDefinitionApi._isOpen({ challenge })
      console.log(`_isOpen backend result: ${response}`)
      console.log(`_isOpen backend data result: ${response.data}`)
      console.log(`_isOpen backend data result: ${response.data}`)
      return response.data
    } catch (error) {
      console.error('_isOpen failed:', error)
      return { status: 'failed', error: error }
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
    _getChallengeDetails,
    _getCreator,
    _isOpen,
  }
})
