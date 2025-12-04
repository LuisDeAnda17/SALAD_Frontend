<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useChallengeParticipationStore } from '@/stores/challengeParticipation'
import { useRouter } from 'vue-router'
import ChallengeList from '@/components/challenges/ChallengeList.vue'

const authStore = useAuthStore()

const { user, userId, sessionId } = storeToRefs(authStore)

const challengeParticipationStore = useChallengeParticipationStore()
const challengeDefinitionStore = useChallengeDefinitionStore()

const { _getUserParticipations, _getUserInvitations } = challengeParticipationStore
const { _getCreatedChallenges } = challengeDefinitionStore

const participations = ref<Array<{ participation: string; challenge: string }>>([])

const createdChallenges = ref<Array<{ challenge: string }>>([])

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
    <div>
      <h2>Your Challenges</h2>
      <ChallengeList :challenges="participations" :role="'participant'" />
    </div>
    <div>
      <h2>Challenges Created</h2>
      <ChallengeList :challenges="createdChallenges" :role="'creator'" />
    </div>
    <div>
      <h2>Verification Requests</h2>
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
</style>
