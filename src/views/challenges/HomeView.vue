<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useChallengeParticipationStore } from '@/stores/challengeParticipation'
import { useChallengeVerificationStore } from '@/stores/challengeVerification'
import VerificationRequestList from '@/components/challenges/VerificationRequestList.vue'
import { useRouter } from 'vue-router'
import ChallengeList from '@/components/challenges/ChallengeList.vue'

const authStore = useAuthStore()

const { user, userId, sessionId } = storeToRefs(authStore)

const challengeParticipationStore = useChallengeParticipationStore()
const challengeDefinitionStore = useChallengeDefinitionStore()
const challengeVerificationStore = useChallengeVerificationStore()

const { _getUserParticipations, _getUserInvitations } = challengeParticipationStore
const { _getCreatedChallenges } = challengeDefinitionStore
const { _getApproverActiveRequests } = challengeVerificationStore

const invitations = ref<Array<{ invitation: string; challenge: string }>>([])
const verificationRequests = ref<Array<{ verificationRequest: string }>>([])

// Computed flag to trigger white dot
const hasPendingRequests = computed(() => {
  return invitations.value.length > 0 || verificationRequests.value.length > 0
})

const fetchPageData = async () => {
  try {
    if (userId.value) {
      const invitationData = await _getUserInvitations(userId.value)

      if (Array.isArray(invitationData)) {
        invitations.value = invitationData
      }
      const verificationRequestResult = await _getApproverActiveRequests(userId.value)

      if (Array.isArray(verificationRequestResult)) {
        verificationRequests.value = verificationRequestResult
      }
    }
  } catch (error) {
    console.error('Error loading initial data:', error)
  }
}

// load initial data when component mounts
onMounted(fetchPageData)
</script>

<template>
  <div v-if="userId" id="challenge-home-wrapper">
    <div class="main-nav-buttons">
      <!-- Progress -->
      <router-link class="nav-card" to="/progress">
        <h3>Progress</h3>
        <h4 class="description">
          Check progress on your challenges and request verification for new progress.
        </h4>
      </router-link>

      <!-- Manage -->
      <router-link class="nav-card" to="/manage">
        <h3>Manage</h3>
        <h4 class="description">Manage the challenges you've created.</h4>
      </router-link>

      <!-- Requests -->
      <router-link class="nav-card" to="/requests">
        <div class="requests-header">
          <h3>Requests</h3>

          <!-- Notification Dot -->
          <span v-if="hasPendingRequests" class="notification-dot" />
        </div>
        <h4 class="description">Review verification requests from other users.</h4>
      </router-link>
    </div>

    <!-- Create -->
    <router-link class="nav-card create-card" to="/create">
      <h3>Create Challenge</h3>
    </router-link>
  </div>
</template>

<style scoped>
#challenge-home-wrapper {
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
  color: white;
}

.main-nav-buttons {
  display: flex;
  flex-direction: row;
  gap: 24px;
}

/* Make router-link look like button-card */
.nav-card {
  display: block;
  background-color: #1e1e1e;
  padding: 16px 20px;
  border-radius: 12px;
  width: 260px;
  border: 1px solid #333;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  text-align: center;
  align-items: center;
  display: flex;
  flex-direction: column;

  transition: all 0.15s ease-out;
}

.nav-card:hover {
  background-color: #2a2a2a;
  border-color: #666;
  transform: translateY(-2px);
}

.nav-card h3 {
  font-size: 1.4rem;
  margin-bottom: 8px;
}

.nav-card h4 {
  font-size: 0.95rem;
  color: rgb(200, 200, 200);
  font-weight: 400;
}

.create-card {
  text-align: center;
  padding: 14px;
  font-size: 1.2rem;
}

.description {
  width: 90%;
}

/* Align h3 + dot horizontally */
.requests-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* White notification dot */
.notification-dot {
  width: 10px;
  height: 10px;
  background-color: white;
  border-radius: 50%;
  display: inline-block;
}
</style>
