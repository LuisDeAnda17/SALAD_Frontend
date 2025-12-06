<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import type { ExerciseInfo } from '@/types/challengeDefinition'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useChallengeVerificationStore } from '@/stores/challengeVerification'
import { useChallengeProgressStore } from '@/stores/challengeProgress'
import { useRouter } from 'vue-router'
const props = defineProps<{ verificationRequest: string; role: string }>()
const authStore = useAuthStore()
const { _getUsername } = authStore
const challengeVerificationStore = useChallengeVerificationStore()
const { _getRequestDetails } = challengeVerificationStore
const challengeDefinitionStore = useChallengeDefinitionStore()
const { _getChallengeDetails } = challengeDefinitionStore
const challengeProgressStore = useChallengeProgressStore()
const { _getPartDayWeek } = challengeProgressStore

const challenge = ref<string>('')
const exercise = ref<string>('')
const level = ref<number>(1)
const day = ref<number>(1)
const week = ref<number>(1)
const part = ref<string>('')
const requester = ref<string>('')
const requesterUsername = ref<string>('')

async function fetchData() {
  const requestDetails = await _getRequestDetails(props.verificationRequest)
  if (Array.isArray(requestDetails) && requestDetails[0]) {
    requester.value = requestDetails[0].requester
    const requesterUsernameResult = await _getUsername(requester.value)
    if (Array.isArray(requesterUsernameResult) && requesterUsernameResult[0]) {
      requesterUsername.value = requesterUsernameResult[0].username
    }
    part.value = requestDetails[0].part
    if (part.value) {
      const dayWeekResult = await _getPartDayWeek([part.value])
      if (
        Array.isArray(dayWeekResult) &&
        dayWeekResult[0] &&
        dayWeekResult[0].part === part.value
      ) {
        day.value = dayWeekResult[0].day
        week.value = dayWeekResult[0].week
      }
    }
    challenge.value = requestDetails[0].challenge
  }
  const challengeDetails = await _getChallengeDetails(challenge.value)
  if (Array.isArray(challengeDetails) && challengeDetails[0]) {
    exercise.value = challengeDetails[0].exercise
    level.value = challengeDetails[0].level
  }
}

onMounted(fetchData)
</script>

<template>
  <router-link
    :to="{
      path: `/challenge/${challenge}/${role}`,
      query: { verificationRequest: verificationRequest },
    }"
  >
    <div class="card">
      <h3>{{ exercise }} ⋅ Level {{ level }}</h3>
      <h4>Week {{ week }} Day {{ day }}</h4>
      <h4 v-if="role === 'approver'">requested by {{ requesterUsername }}</h4>
    </div>
  </router-link>
</template>

<style scoped>
.card {
  width: 200px;
  padding: 1rem 1.25rem;

  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;

  color: white;
  text-decoration: none;

  cursor: pointer;
  transition: all 0.2s ease;

  /* makes the whole card feel like an elevated icon */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.card:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
}

.card h3,
.card h4 {
  margin: 0;
  padding: 0;
  color: white;
}

.card h3 {
  font-size: 1.1rem;
  font-weight: 600;
}

.card h4 {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* router-link should not override card styling */
a {
  text-decoration: none;
  color: inherit;
}
</style>
