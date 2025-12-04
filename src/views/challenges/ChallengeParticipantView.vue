<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useChallengeProgressStore } from '@/stores/challengeProgress'
import { useChallengeVerificationStore } from '@/stores/challengeVerification'
import { useRoute } from 'vue-router'

const role = 'participant'
const route = useRoute()
const challenge = route.params.challenge as string // the UUID
const authStore = useAuthStore()
const { _getUsername, _getUser } = authStore
const { userId, sessionId } = storeToRefs(authStore)
const challengeDefinitionStore = useChallengeDefinitionStore()
const { deleteChallenge, _getChallengeDetails } = challengeDefinitionStore

const challengeProgressStore = useChallengeProgressStore()

const { _getParts, _getCompletedParts } = challengeProgressStore
const challengeVerificationStore = useChallengeVerificationStore()

const { _getRequesterActiveRequests } = challengeVerificationStore

const daysPerWeek = ref<number>(1)
const weeks = ref<number>(1)

const completedParts = ref<Array<{ part: string; day: number; week: number }>>([])
const activeRequests = ref<Array<{ part: string; verificationRequest: string }>>([])

async function fetchParticipantData() {}

onMounted(fetchParticipantData)
</script>

<template>
  <h2>Progress</h2>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}
</style>
