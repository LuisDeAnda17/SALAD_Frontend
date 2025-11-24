import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/api'
import { challengesApi } from '@/services/api/challengesApi'

export const useChallengesStore = defineStore('challenges', () => {})
