<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import type {
  ExerciseInfo,
  RepAerobicInfo,
  AnaerobicInfo,
  DistanceAerobicInfo,
} from '@/types/challengeDefinition'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
const role = 'creator'
const route = useRoute()
const challenge = route.params.challenge as string // the UUID

const challengeDefinitionStore = useChallengeDefinitionStore()
const { deleteChallenge } = challengeDefinitionStore
</script>

<template>Challenge Creator</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}
</style>
