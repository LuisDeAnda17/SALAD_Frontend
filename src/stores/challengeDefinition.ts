import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/api'
import { challengeDefinitionApi } from '@/services/api/challengeDefinitionApi'

export const useChallengeDefinitionStore = defineStore('challengeDefinition', () => {})
