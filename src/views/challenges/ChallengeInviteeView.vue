<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useRouter } from 'vue-router'
import { useChallengeParticipationStore } from '@/stores/challengeParticipation'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
const role = 'invitee'
const route = useRoute()
const challenge = route.params.challenge as string // the UUID
const challengeParticipationStore = useChallengeParticipationStore()
const { acceptInvitation, _getInvitation, removeInvitation } = challengeParticipationStore

const authStore = useAuthStore()
const { user, sessionId, userId } = storeToRefs(authStore)

const invitation = ref<string>('')

async function submitAcceptInvitation() {
  if (userId.value && sessionId.value) {
    const invitationResult = await _getInvitation(userId.value, challenge)
    if (Array.isArray(invitationResult) && invitationResult[0])
      await acceptInvitation(sessionId.value, invitationResult[0].invitation)
  }
}

async function submitDeclineInvitation() {
  if (userId.value && sessionId.value) {
    const invitationResult = await _getInvitation(userId.value, challenge)
    if (Array.isArray(invitationResult) && invitationResult[0])
      await removeInvitation(sessionId.value, invitationResult[0].invitation)
  }
}
</script>

<template>
  <div class="invitee-controls">
    <div class="accept-invitation-section">
      <router-link :to="`/challenge/${challenge}/participant`">
        <button class="invitation-btn" @click="submitAcceptInvitation">Accept Invitation</button>
      </router-link>
    </div>
    <div class="decline-invitation-section">
      <router-link :to="`/invitations`">
        <button class="invitation-btn" @click="submitDeclineInvitation">Decline Invitation</button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.invitee-controls {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  gap: 1rem;
}

.invitation-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.7rem 1.4rem;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}

.invitation-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.invitation-btn.active {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
}
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}
</style>
