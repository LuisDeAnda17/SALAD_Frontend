<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useChallengeProgressStore } from '@/stores/challengeProgress'
import { useChallengeVerificationStore } from '@/stores/challengeVerification'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/utils/date-utils'
const props = defineProps<{ verificationRequest: string; role: string }>()
// --- Stores ---
const authStore = useAuthStore()
const { userId, sessionId } = storeToRefs(authStore)
const { _getUser, _getUsername } = authStore

const challengeVerificationStore = useChallengeVerificationStore()
const { createVerificationRequest, removeVerificationRequest, _getRequestDetails } =
  challengeVerificationStore

const challengeProgressStore = useChallengeProgressStore()
const { _getPartDayWeek } = challengeProgressStore

const approver = ref<string>()
const approverUsername = ref<string>()
const requester = ref<string>()
const requesterUsername = ref<string>()
const evidence = ref<string>()
const part = ref<string>()
const day = ref<number>()
const week = ref<number>()
const dateCompleted = ref<Date>()

const dateCompletedStr = computed(() => {
  return dateCompleted.value ? formatDate(dateCompleted.value) : null
})

async function fetchData() {
  const requestDetails = await _getRequestDetails(props.verificationRequest)
  if (Array.isArray(requestDetails) && requestDetails[0]) {
    approver.value = requestDetails[0].approver
    const approverUsernameResult = await _getUsername(approver.value)
    if (Array.isArray(approverUsernameResult) && approverUsernameResult[0]) {
      approverUsername.value = approverUsernameResult[0].username
    }
    requester.value = requestDetails[0].requester
    const requesterUsernameResult = await _getUsername(requester.value)
    if (Array.isArray(requesterUsernameResult) && requesterUsernameResult[0]) {
      requesterUsername.value = requesterUsernameResult[0].username
    }
    evidence.value = requestDetails[0].evidence
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
    const raw = requestDetails[0].dateCompleted
    const d = new Date(raw) // now it's a real Date

    dateCompleted.value = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  }
}

onMounted(fetchData)
</script>
<template>
  <div class="verification-card">
    <h3>Verification Request</h3>

    <div class="info-row">
      <p><strong>Week</strong> {{ week }}</p>
      <p><strong>Day</strong> {{ day }}</p>
    </div>

    <div class="info-row">
      <p>Date Completed: {{ dateCompletedStr }}</p>
    </div>

    <div class="info-row">
      <p v-if="role === 'approver'"><strong>Requester:</strong> {{ requesterUsername }}</p>
      <p v-if="role === 'requester'"><strong>Approver:</strong> {{ approverUsername }}</p>
    </div>

    <div class="info-column">
      <p><strong>Evidence:</strong></p>
      <p class="evidence-box">{{ evidence }}</p>
    </div>
  </div>
</template>
<style scoped>
/* Main info card */
.verification-card {
  background: #111;
  padding: 1.5rem;
  border-radius: 12px;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}
.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  gap: 3rem;
}
.info-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.evidence-box {
  background: #222;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #444;
  color: #ddd;
  white-space: pre-wrap;
}
</style>
