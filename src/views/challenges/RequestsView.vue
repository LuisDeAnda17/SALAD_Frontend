<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useChallengeParticipationStore } from '@/stores/challengeParticipation'
import { useChallengeVerificationStore } from '@/stores/challengeVerification'
import { useRouter } from 'vue-router'
import VerificationRequestList from '@/components/challenges/VerificationRequestList.vue'
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
  <div v-if="user" id="challenge-requests-wrapper">
    <div class="requests-column">
      <h2>Invitations</h2>
      <ChallengeList :challenges="invitations" :role="'invitee'" />
      <h4 v-if="invitations.length === 0" class="empty-msg">
        You have not been invited to any challenges yet.
      </h4>
    </div>
    <div class="requests-column">
      <h2>Verification Requests</h2>
      <VerificationRequestList
        :verificationRequests="verificationRequests"
        :role="'approver'"
      ></VerificationRequestList>
      <h4 v-if="verificationRequests.length === 0" class="empty-msg">
        No one has requested verification from you yet.
      </h4>
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

#challenge-requests-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  gap: 24px;
  align-items: start;
  color: white;
}

.empty-msg {
  color: rgb(188, 188, 188);
  padding-top: 2rem;
  max-width: 80%;
  text-align: center;
}

.requests-column {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
}
</style>
