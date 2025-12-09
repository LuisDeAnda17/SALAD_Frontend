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

const participations = ref<Array<{ participation: string; challenge: string }>>([])

const createdChallenges = ref<Array<{ challenge: string }>>([])

const verificationRequests = ref<Array<{ verificationRequest: string }>>([])

const fetchPageData = async () => {
  try {
    if (userId.value) {
      const participationData = await _getUserParticipations(userId.value)

      const createdChallengeData = await _getCreatedChallenges(userId.value)
      if (Array.isArray(participationData)) {
        participations.value = participationData
      }

      if (Array.isArray(createdChallengeData)) {
        createdChallenges.value = createdChallengeData
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
  <div v-if="user" id="challenge-home-wrapper">
    <div class="home-column">
      <h2>Your Challenges</h2>
      <ChallengeList :challenges="participations" :role="'participant'" />
      <h4 v-if="participations.length === 0" class="empty-msg">
        You are currently not participating in any challenges.
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

#challenge-home-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  gap: 24px;
  align-items: start;
  color: white;
}

.empty-msg {
  color: rgb(188, 188, 188);
  padding-top: 1rem;
  max-width: 80%;
  text-align: center;
}

.home-column {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
}
</style>
