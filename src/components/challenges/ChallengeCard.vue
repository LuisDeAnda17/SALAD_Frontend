<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import type { ExerciseInfo } from '@/types/challengeDefinition'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useChallengeParticipationStore } from '@/stores/challengeParticipation'
import { useRouter } from 'vue-router'
import { formatDate } from '@/utils/date-utils'
const props = defineProps<{ challenge: any; role: any }>()
const authStore = useAuthStore()
const challengeDefinitionStore = useChallengeDefinitionStore()
const { _getChallengeDetails, _getCreator, _getDateCreated, _getChallengeName } =
  challengeDefinitionStore
const { _getUsername } = authStore

const exercise = ref<string>('')
const level = ref<number>(1)
const daysPerWeek = ref<number>(1)
const weeks = ref<number>(1)
const info = ref<ExerciseInfo | null>(null)
const creator = ref<string>('')
const name = ref<string>('')
const dateCreated = ref<Date>()
const dateCreatedString = ref<string>()
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
      const creatorId = challengeCreator.creator
      console.log(`Creator ID identified: ${creatorId}`)
      const creatorResult = await _getUsername(creatorId)
      if (Array.isArray(creatorResult)) {
        const creatorUsername = creatorResult[0]
        if (creatorUsername) {
          creator.value = creatorUsername.username
        }
      }
    }
  }
  const challengeNameResult = await _getChallengeName(props.challenge)
  if (Array.isArray(challengeNameResult) && challengeNameResult[0]) {
    name.value = challengeNameResult[0].name
  }

  const dateCreatedResult = await _getDateCreated(props.challenge)
  if (Array.isArray(dateCreatedResult) && dateCreatedResult[0]) {
    dateCreated.value = dateCreatedResult[0].dateCreated
    dateCreatedString.value = formatDate(dateCreated.value)
  }
  console.log('details:', challengeDetailsResult)
  console.log('creator:', challengeCreatorResult)
}

onMounted(fetchCardData)
</script>
<template>
  <router-link :to="`/challenge/${challenge}/${role}`">
    <div class="card">
      <h3>{{ name }}</h3>
      <h4>{{ exercise }} ⋅ Level {{ level }}</h4>
      <h4>created by {{ creator }} on {{ dateCreatedString }}</h4>
    </div>
  </router-link>
</template>
<style scoped>
.card {
  width: 200px;
  padding: 1rem 1.25rem;

  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;

  color: white;
  text-decoration: none;

  cursor: pointer;
  transition: all 0.2s ease;

  /* makes the whole card feel like an elevated icon */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.card:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
}

.card h3,
.card h4 {
  margin: 0;
  padding: 0;
  color: white;
}

.card h3 {
  font-size: 1.1rem;
  font-weight: 600;
}

.card h4 {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* router-link should not override card styling */
a {
  text-decoration: none;
  color: inherit;
}
</style>
