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

const { _getUserParticipations, _getUserInvitations } = challengeParticipationStore

const participations = ref<Array<{ participation: string; challenge: string }>>([])
const invitations = ref<Array<{ invitation: string; challenge: string }>>([])

const fetchPageData = async () => {
  try {
    if (userId.value) {
      const participationData = await _getUserParticipations(userId.value)
      const invitationData = await _getUserInvitations(userId.value)
      if (Array.isArray(participationData)) {
        participations.value = participationData
      }
      if (Array.isArray(invitationData)) {
        invitations.value = invitationData
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
  <h2>Your Challenges</h2>
  <ChallengeList :challenges="participations" />

  <h2>Invitations</h2>
  <ChallengeList :challenges="invitations" />
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}
</style>
