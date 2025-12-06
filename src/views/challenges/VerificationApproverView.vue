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
</script>
<template>
  <div v-if="userId" class="verification-panel">
    <VerificationRequestDetails
      :role="'requester'"
      :verificationRequest="verificationRequest"
    ></VerificationRequestDetails>
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
</style>
