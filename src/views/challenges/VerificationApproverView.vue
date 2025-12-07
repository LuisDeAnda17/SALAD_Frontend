<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useChallengeProgressStore } from '@/stores/challengeProgress'
import { useChallengeVerificationStore } from '@/stores/challengeVerification'
import { useRoute } from 'vue-router'
import VerificationRequestDetails from '@/components/challenges/VerificationRequestDetails.vue'

// --- Route ---
const route = useRoute()
const challenge = route.params.challenge as string
const verificationRequest = route.query.verificationRequest as string

// --- Stores ---
const authStore = useAuthStore()
const { userId, sessionId } = storeToRefs(authStore)
const { _getUser, _getUsername } = authStore
const challengeVerificationStore = useChallengeVerificationStore()
const { removeVerificationRequest, verify } = challengeVerificationStore

const showRejectConfirm = ref<boolean>(false)

// --- Functions ---

async function submitApproveRequest() {
  if (sessionId.value) {
    await verify(sessionId.value, verificationRequest)
  }
}

async function submitRejectRequest() {
  if (sessionId.value) {
    await removeVerificationRequest(sessionId.value, verificationRequest)
  }
}
</script>
<template>
  <div v-if="userId" class="verification-panel">
    <VerificationRequestDetails
      :role="'approver'"
      :verificationRequest="verificationRequest"
    ></VerificationRequestDetails>
    <!-- RESPONSE SECTION -->
    <div class="approve-section">
      <router-link :to="`/`">
        <button class="approve-btn" @click="submitApproveRequest">Approve</button>
      </router-link>
    </div>
    <div class="reject-section">
      <!-- initial delete button -->
      <button v-if="!showRejectConfirm" class="reject-btn" @click="showRejectConfirm = true">
        Reject
      </button>

      <!-- confirmation box -->
      <div v-if="showRejectConfirm" class="reject-confirm-card">
        <p class="warning-title">Are you sure?</p>
        <p class="warning-desc">
          This action cannot be undone. This verification request will be permanently deleted.
        </p>

        <div class="confirm-actions">
          <router-link :to="`/`">
            <button class="confirm-reject-btn" @click="submitRejectRequest">Yes, Reject</button>
          </router-link>

          <button class="cancel-reject-btn" @click="showRejectConfirm = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.verification-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  color: white;
}

/* REJECT BUTTON SECTION */
.reject-section,
.approve-section {
  display: flex;
  justify-content: center;
}

.reject-btn {
  padding: 0.6rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: 0.2s;
}
.reject-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.approve-btn {
  padding: 0.6rem 1rem;
  background: rgba(62, 99, 62, 0.2);
  border: 1px solid rgba(62, 99, 62, 0.6);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: 0.2s;
}
.approve-btn:hover {
  background: rgba(62, 99, 62, 0.3);
}

/* CONFIRM REJECT PANEL */
.reject-confirm-card {
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

.confirm-reject-btn {
  padding: 0.6rem 1rem;
  background: rgba(239, 68, 68, 0.25);
  border: 1px solid rgba(239, 68, 68, 0.6);
  border-radius: 6px;
  color: white;
  cursor: pointer;
}
.confirm-reject-btn:hover {
  background: rgba(239, 68, 68, 0.4);
}

.cancel-reject-btn {
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #666;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}
.cancel-reject-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
