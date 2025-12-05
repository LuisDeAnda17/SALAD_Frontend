import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/api'
import { friendingApi } from '@/services/api/friendingApi'

export const useFriendingStore = defineStore('friending', () => {
  async function _getFriends(user: string) {
    try {
      const response = await friendingApi.getFriends({ user })
      console.log(`getFriends result: ${response}`)
      return response.data
    } catch (error) {
      console.error('getFriends failed:', error)
      return { status: 'failed', error: error }
    }
  }
  return {
    _getFriends,
  }
})
