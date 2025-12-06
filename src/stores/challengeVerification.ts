import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/api'
import { challengeVerificationApi } from '@/services/api/challengeVerificationApi'

export const useChallengeVerificationStore = defineStore('challengeVerification', () => {
  async function createVerificationRequest(
    session: string,
    challenge: string,
    part: string,
    requester: string,
    approver: string,
    evidence: string,
  ) {
    try {
      const response = await challengeVerificationApi.createVerificationRequest({
        session,
        challenge,
        part,
        requester,
        approver,
        evidence,
      })
      return response.data
    } catch (error) {
      console.error('createVerificationRequest failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function removeVerificationRequest(session: string, verificationRequest: string) {
    try {
      const response = await challengeVerificationApi.removeVerificationRequest({
        session,
        verificationRequest,
      })
      return response.data
    } catch (error) {
      console.error('createVerificationRequest failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function verify(session: string, verificationRequest: string) {
    try {
      const response = await challengeVerificationApi.verify({
        session,
        verificationRequest,
      })
      return response.data
    } catch (error) {
      console.error('verify failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function _getRequesterActiveRequests(user: string, challenge: string) {
    try {
      const response = await challengeVerificationApi._getRequesterActiveRequests({
        user,
        challenge,
      })
      return response.data
    } catch (error) {
      console.error('_getRequesterActiveRequests failed:', error)
      return { status: 'failed', error: error }
    }
  }

  async function _getRequestDetails(verificationRequest: string) {
    try {
      const response = await challengeVerificationApi._getRequestDetails({
        verificationRequest,
      })
      return response.data
    } catch (error) {
      console.error('_getRequesterDetails failed:', error)
      return { status: 'failed', error: error }
    }
  }

  return {
    //State
    //Actions
    createVerificationRequest,
    removeVerificationRequest,
    verify,
    _getRequesterActiveRequests,
    _getRequestDetails,
  }
})
