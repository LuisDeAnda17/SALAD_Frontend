<script setup lang="ts">
import { ref, computed, onMounted, defineProps } from 'vue'
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
