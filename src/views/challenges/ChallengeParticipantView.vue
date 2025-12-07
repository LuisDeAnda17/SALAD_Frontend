<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useChallengeProgressStore } from '@/stores/challengeProgress'
import { useChallengeVerificationStore } from '@/stores/challengeVerification'
import { useChallengeParticipationStore } from '@/stores/challengeParticipation'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const challenge = route.params.challenge as string

// Stores
const authStore = useAuthStore()
const { userId, sessionId } = storeToRefs(authStore)

const challengeDefinitionStore = useChallengeDefinitionStore()
const { _getChallengeDetails } = challengeDefinitionStore

const challengeProgressStore = useChallengeProgressStore()
const { _getParts, _getCompletedParts } = challengeProgressStore

const challengeVerificationStore = useChallengeVerificationStore()
const { _getRequesterActiveRequests } = challengeVerificationStore

const challengeParticipationStore = useChallengeParticipationStore()
const { removeParticipation, _getParticipation } = challengeParticipationStore

// State
const daysPerWeek = ref(1)
const weeks = ref(1)

const parts = ref<Array<{ part: string; day: number; week: number }>>([])
const completedParts = ref<Array<{ part: string; day: number; week: number }>>([])
const activeRequests = ref<Array<{ part: string; verificationRequest: string }>>([])

const lockedMessage = ref('')
let messageTimeout: any = null

async function submitLeaveChallenge() {
  if (userId.value && sessionId.value) {
    const result = await _getParticipation(userId.value, challenge)
    if (Array.isArray(result) && result[0]) {
      await removeParticipation(sessionId.value, result[0].participation)
    }
  }
}

async function fetchParticipantData() {
  const details = await _getChallengeDetails(challenge)
  if (Array.isArray(details) && details[0]) {
    daysPerWeek.value = details[0].daysPerWeek
    weeks.value = details[0].weeks
  }

  const partsResult = await _getParts(challenge)
  if (Array.isArray(partsResult)) parts.value = partsResult

  if (userId.value) {
    const completedPartsResult = await _getCompletedParts(userId.value, challenge)
    if (Array.isArray(completedPartsResult)) completedParts.value = completedPartsResult

    const activeRequestsResult = await _getRequesterActiveRequests(userId.value, challenge)
    if (Array.isArray(activeRequestsResult)) activeRequests.value = activeRequestsResult
  }
}

onMounted(fetchParticipantData)

// Helpers
function getPartFor(day: number, week: number) {
  return parts.value.find((p) => p.day === day && p.week === week)
}

function isCompleted(day: number, week: number) {
  return completedParts.value.some((p) => p.day === day && p.week === week)
}

function isActiveRequest(day: number, week: number) {
  const part = getPartFor(day, week)
  if (!part) return false
  return activeRequests.value.some((r) => r.part === part.part)
}

function canClickEmptyCell(day: number, week: number) {
  if (day === 1) return true

  const prevCompleted = isCompleted(day - 1, week)
  const prevRequested = isActiveRequest(day - 1, week)

  return prevCompleted || prevRequested
}

function showLockedMessage() {
  lockedMessage.value = 'You must request verification for the previous day first.'

  if (messageTimeout) clearTimeout(messageTimeout)
  messageTimeout = setTimeout(() => {
    lockedMessage.value = ''
  }, 5000)
}

// UPDATED CLICK HANDLER
function onCellClick(day: number, week: number) {
  const completed = isCompleted(day, week)
  const active = isActiveRequest(day, week)
  const part = getPartFor(day, week)

  if (!part) return

  // If completed, ignore
  if (completed) return

  // NEW: Active request → navigate to view page
  if (active) {
    const req = activeRequests.value.find((r) => r.part === part.part)
    if (!req) return

    router.push({
      path: `/challenge/${challenge}/requester`,
      query: {
        verificationRequest: req.verificationRequest,
      },
    })
    return
  }

  // Empty cell logic
  const eligible = canClickEmptyCell(day, week)
  if (!eligible) {
    showLockedMessage()
    return
  }

  router.push({
    path: `/challenge/${challenge}/createVerification`,
    query: { part: part.part, day, week },
  })
}
</script>

<template>
  <div v-if="userId" class="challenge-participant-wrapper">
    <h2 class="progress-title">Progress</h2>

    <div class="progress-grid">
      <div v-for="week in weeks" :key="'week-' + week" class="week-column">
        <div class="week-label">Week {{ week }}</div>

        <div
          v-for="day in daysPerWeek"
          :key="'day-' + week + '-' + day"
          class="cell"
          :class="{
            completed: isCompleted(day, week),
            requested: !isCompleted(day, week) && isActiveRequest(day, week),
            clickable:
              !isCompleted(day, week) &&
              !isActiveRequest(day, week) &&
              canClickEmptyCell(day, week),
            locked:
              !isCompleted(day, week) &&
              !isActiveRequest(day, week) &&
              !canClickEmptyCell(day, week),
          }"
          :data-tooltip="
            isActiveRequest(day, week)
              ? 'View Request'
              : !isCompleted(day, week) &&
                  !isActiveRequest(day, week) &&
                  canClickEmptyCell(day, week)
                ? 'Create Request'
                : ''
          "
          @click="onCellClick(day, week)"
        ></div>
      </div>
    </div>

    <p v-if="lockedMessage" class="locked-tip">{{ lockedMessage }}</p>

    <div class="leave-challenge-controls">
      <router-link :to="`/`">
        <button class="leave-challenge-btn" @click="submitLeaveChallenge">Leave Challenge</button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.challenge-participant-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  gap: 1rem;
}

.progress-title {
  color: white;
  font-weight: 600;
  margin-bottom: 1rem;
}

.progress-grid {
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.week-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.week-label {
  color: white;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Base cell */
.cell {
  position: relative;
  width: 2rem;
  height: 2rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.25s ease;
}

/************************************
  TOOLTIP
*************************************/
.cell[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(20, 20, 20, 0.9);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: white;
  font-size: 0.7rem;
  white-space: nowrap;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/************************************
  CLICK STATES
*************************************/

/* Clickable empty cell */
.cell.clickable {
  cursor: pointer;
}

.cell.clickable:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.25);
}

/* Locked cell */
.cell.locked {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.1);
  cursor: default;
}

/* No hover effect */
.cell.locked:hover {
  transform: none;
}

/************************************
  STATUS COLORS
*************************************/

/* Completed */
.completed {
  background: #2563eb;
  border-color: rgba(37, 99, 235, 0.8);
  cursor: default;
}

/* Active request */
.requested {
  background: rgba(37, 99, 235, 0.35);
  border-color: rgba(37, 99, 235, 0.45);
  cursor: pointer;
}

/* Hover for active request */
.requested:hover {
  background: rgba(37, 99, 235, 0.5);
  border-color: rgba(37, 99, 235, 0.7);
  transform: scale(1.06);
}

/************************************
  MESSAGES
*************************************/
.locked-tip {
  color: #f87171;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  opacity: 0.9;
}

.leave-challenge-controls {
  display: flex;
  justify-content: center;
}

.leave-challenge-btn {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.leave-challenge-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}
</style>
