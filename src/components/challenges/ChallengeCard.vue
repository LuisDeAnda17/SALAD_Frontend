<script setup lang="ts">
import { ref, computed, onMounted, defineProps } from 'vue'
import { storeToRefs } from 'pinia'
import type { ExerciseInfo } from '@/types/challengeDefinition'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useChallengeParticipationStore } from '@/stores/challengeParticipation'
import { useRouter } from 'vue-router'
const props = defineProps<{ challenge: any; role: any }>()
const challengeDefinitionStore = useChallengeDefinitionStore()
const { _getChallengeDetails, _getCreator } = challengeDefinitionStore

const exercise = ref<string>('')
const level = ref<number>(1)
const daysPerWeek = ref<number>(1)
const weeks = ref<number>(1)
const info = ref<ExerciseInfo | null>(null)
const creator = ref<string>('')
async function fetchCardData() {
  const challengeDetailsResult = await _getChallengeDetails(props.challenge)
  if (Array.isArray(challengeDetailsResult)) {
    const challengeDetails = challengeDetailsResult[0]
    if (challengeDetails) {
      exercise.value = challengeDetails.exercise
      level.value = challengeDetails.level
    }
  }

  const challengeCreatorResult = await _getCreator(props.challenge)
  if (Array.isArray(challengeCreatorResult)) {
    const challengeCreator = challengeCreatorResult[0]
    if (challengeCreator) {
      creator.value = challengeCreator.creator
    }
  }
  console.log('details:', challengeDetailsResult)
  console.log('creator:', challengeCreatorResult)
}

onMounted(fetchCardData)
</script>
<template>
  <router-link :to="`/challenge/${challenge}`">
    <div class="card">
      <h3>{{ exercise }}</h3>
      <h3>Level {{ level }}</h3>
      <h4>by {{ creator }}</h4>
    </div>
  </router-link>
</template>
<style scoped>
.card {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
}
</style>
