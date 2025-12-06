<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useChallengeParticipationStore } from '@/stores/challengeParticipation'
const props = defineProps<{ user: string }>()
const authStore = useAuthStore()
const { sessionId } = storeToRefs(authStore)
const { _getUsername } = authStore

const challengeParticipationStore = useChallengeParticipationStore()
const { removeInvitation, removeParticipation, _getInvitation } = challengeParticipationStore

const username = ref<string>('')

async function fetchCardData() {
  const usernameResult = await _getUsername(props.user)
  if (Array.isArray(usernameResult) && usernameResult[0]) {
    username.value = usernameResult[0].username
  }
}

onMounted(fetchCardData)
</script>
<template>
  <div class="card">
    <h3>{{ username }}</h3>
  </div>
</template>
<style scoped>
.card {
  border-color: rgb(62, 99, 62, 0.5);
  background-color: rgb(62, 99, 62, 0.2);
  border-width: 2px;
  border-style: solid;
  padding: 4px;
  max-width: 100px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  border-radius: 4px;

  /* Interaction styling */
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    filter 0.15s ease;
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  filter: brightness(1.08);
}
</style>
