<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useChallengeProgressStore } from '@/stores/challengeProgress'
import { useChallengeVerificationStore } from '@/stores/challengeVerification'
import { useRoute } from 'vue-router'

// --- Route ---
const route = useRoute()
const verificationRequest = route.query.verificationRequest as string

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
const day = ref<string>()
const week = ref<string>()

const showDeleteConfirm = ref(false)

async function submitRemoveVerificationRequest() {
  if (sessionId.value) {
    await removeVerificationRequest(sessionId.value, verificationRequest)
  }
}

async function fetchData() {
  const requestDetails = await _getRequestDetails(verificationRequest)
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
  }
}
</script>
<template>
  <div v-if="userId" class="verification-panel">
    <div class="verification-card">
      <h3>Verification Request</h3>

      <div class="info-row">
        <p><strong>Week:</strong> {{ week }}</p>
        <p><strong>Day:</strong> {{ day }}</p>
      </div>

      <div class="info-row">
        <p><strong>Requester:</strong> {{ requesterUsername }}</p>
        <p><strong>Approver:</strong> {{ approverUsername }}</p>
      </div>

      <div class="info-column">
        <p><strong>Evidence:</strong></p>
        <p class="evidence-box">{{ evidence }}</p>
      </div>
    </div>

    <!-- DELETE SECTION -->
    <div class="delete-section">
      <!-- initial delete button -->
      <button v-if="!showDeleteConfirm" class="delete-btn" @click="showDeleteConfirm = true">
        Delete Verification Request
      </button>

      <!-- confirmation box -->
      <div v-if="showDeleteConfirm" class="delete-confirm-card">
        <p class="warning-title">Are you sure?</p>
        <p class="warning-desc">
          This action cannot be undone. This verification request will be permanently deleted.
        </p>

        <div class="confirm-actions">
          <button class="confirm-delete-btn" @click="submitRemoveVerificationRequest">
            Yes, Delete
          </button>

          <button class="cancel-delete-btn" @click="showDeleteConfirm = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.verification-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  justify-content: center;
  align-items: center;
  color: white;
}

/* Main info card */
.verification-card {
  background: #111;
  padding: 1.5rem;
  border-radius: 12px;
  width: 100%;
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

/* DELETE BUTTON SECTION */
.delete-section {
  display: flex;
  justify-content: center;
}

.delete-btn {
  padding: 0.6rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: 0.2s;
}
.delete-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* CONFIRM DELETE PANEL */
.delete-confirm-card {
  background: #1a1a1a;
  border: 1px solid rgba(239, 68, 68, 0.4);
  padding: 1.5rem;
  border-radius: 12px;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 1rem;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.2);
}

.warning-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: rgba(239, 68, 68, 0.9);
}

.warning-desc {
  color: #ccc;
  font-size: 0.95rem;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.confirm-delete-btn {
  padding: 0.6rem 1rem;
  background: rgba(239, 68, 68, 0.25);
  border: 1px solid rgba(239, 68, 68, 0.6);
  border-radius: 6px;
  color: white;
  cursor: pointer;
}
.confirm-delete-btn:hover {
  background: rgba(239, 68, 68, 0.4);
}

.cancel-delete-btn {
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #666;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}
.cancel-delete-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
