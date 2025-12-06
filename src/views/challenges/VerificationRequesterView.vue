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
const { createVerificationRequest, removeVerificationRequest, _getRequestDetails } =
  challengeVerificationStore

const showDeleteConfirm = ref(false)

async function submitRemoveVerificationRequest() {
  if (sessionId.value) {
    await removeVerificationRequest(sessionId.value, verificationRequest)
  }
}
</script>
<template>
  <div v-if="userId" class="verification-panel">
    <VerificationRequestDetails
      :role="'requester'"
      :verificationRequest="verificationRequest"
    ></VerificationRequestDetails>

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
          <router-link :to="`/challenge/${challenge}/participant`">
            <button class="confirm-delete-btn" @click="submitRemoveVerificationRequest">
              Yes, Delete
            </button>
          </router-link>

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
  justify-content: center;
  align-items: center;
  color: white;
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
