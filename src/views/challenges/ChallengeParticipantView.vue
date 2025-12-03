<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useChallengeProgressStore } from '@/stores/challengeProgress'
import { useRoute } from 'vue-router'

const role = 'participant'
const route = useRoute()
const challenge = route.params.challenge as string // the UUID
const authStore = useAuthStore()
const { _getUsername, _getUser } = authStore
const { userId, sessionId } = storeToRefs(authStore)
const challengeDefinitionStore = useChallengeDefinitionStore()
const { deleteChallenge } = challengeDefinitionStore
</script>

<template>
  <h2>Challenge Progress</h2>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}
</style>
