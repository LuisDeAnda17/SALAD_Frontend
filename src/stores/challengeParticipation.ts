import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/api'
import { challengeParticipationApi } from '@/services/api/challengeParticipationApi'

export const useChallengeParticipationStore = defineStore('challengeParticipation', () => {
  async function createInvitation(session: string, user: string, challenge: string) {
    try {
      const response = await challengeParticipationApi.createInvitation({
        user,
        challenge,
        session,
      })
      return response.data
    } catch (error) {
      console.error('createInvitation failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function removeInvitation(session: string, invitation: string) {
    try {
      const response = await challengeParticipationApi.removeInvitation({
        invitation,
        session,
      })
      return response.data
    } catch (error) {
      console.error('removeInvitation failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function acceptInvitation(session: string, invitation: string) {
    try {
      const response = await challengeParticipationApi.acceptInvitation({
        invitation,
        session,
      })
      return response.data
    } catch (error) {
      console.error('acceptInvitation failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function removeParticipation(session: string, participation: string) {
    try {
      const response = await challengeParticipationApi.removeParticipation({
        participation,
        session,
      })
      return response.data
    } catch (error) {
      console.error('removeParticipation failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function _getChallengeInvitations(challenge: string) {
    try {
      const response = await challengeParticipationApi._getChallengeInvitations({ challenge })
      return response.data
    } catch (error) {
      console.error('_getChallengeInvitations failed:', error)
      return { status: 'failed', error: error }
    }
  }
  async function _getChallengeParticipations(challenge: string) {
    try {
      const response = await challengeParticipationApi._getChallengeParticipations({ challenge })
      return response.data
    } catch (error) {
      console.error('_getChallengeParticipations failed:', error)
      return { status: 'failed', error: error }
    }
  }
  async function _getUserInvitations(user: string) {
    try {
      const response = await challengeParticipationApi._getUserInvitations({ user })
      return response.data
    } catch (error) {
      console.error('_getUserInvitations failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function _getUserParticipations(user: string) {
    try {
      const response = await challengeParticipationApi._getUserParticipations({ user })
      return response.data
    } catch (error) {
      console.error('_getUserParticipations failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function _getInvitation(user: string, challenge: string) {
    try {
      const response = await challengeParticipationApi._getInvitation({ user, challenge })
      return response.data
    } catch (error) {
      console.error('_getInvitation failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function _getParticipation(user: string, challenge: string) {
    try {
      const response = await challengeParticipationApi._getParticipation({ user, challenge })
      return response.data
    } catch (error) {
      console.error('_getParticipation failed:', error)
      return { status: 'failed', error: error }
    }
  }

  return {
    //State
    //Actions
    removeInvitation,
    createInvitation,
    acceptInvitation,
    removeParticipation,
    _getChallengeInvitations,
    _getChallengeParticipations,
    _getUserInvitations,
    _getUserParticipations,
    _getInvitation,
    _getParticipation,
  }
})
