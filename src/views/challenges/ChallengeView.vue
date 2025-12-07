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
import { formatDate } from '@/utils/date-utils'

const route = useRoute()
const challenge = route.params.challenge as string // the UUID

const authStore = useAuthStore()
const challengeDefinitionStore = useChallengeDefinitionStore()
const { _getChallengeDetails, _getCreator, _getChallengeName, _getDateCreated } =
  challengeDefinitionStore
const { _getUsername } = authStore
const { user } = storeToRefs(authStore)

const exercise = ref<string>('')
const level = ref<number>(1)
const daysPerWeek = ref<number>(1)
const weeks = ref<number>(1)
const info = ref<ExerciseInfo | null>(null)
const creator = ref<string>('')
const creatorUsername = ref<string>('')
const name = ref<string>('')
const dateCreated = ref<Date>()
const dateCreatedString = ref<string>()

const category = computed(() => {
  if (info.value) {
    if (info.value._type === 'AnaerobicInfo') {
      return 'anaerobic'
    } else {
      return 'aerobic'
    }
  } else {
    return null
  }
})

const subcategory = computed(() => {
  if (category.value === 'anaerobic' || !info.value) {
    return null
  } else {
    if (info.value._type === 'RepAerobicInfo') {
      return 'rep'
    } else {
      return 'distance'
    }
  }
})

const weight = computed(() => {
  if (info.value && info.value._type === 'AnaerobicInfo' && info.value.weight) {
    return info.value.weight
  } else {
    return null
  }
}) //kg

const reps = computed(() => {
  if (info.value && info.value._type === 'AnaerobicInfo') {
    return info.value.reps
  } else {
    return null
  }
})

const sets = computed(() => {
  if (info.value && info.value._type === 'AnaerobicInfo') {
    return info.value.sets
  } else {
    return null
  }
})

const repSpeed = computed(() => {
  if (info.value && info.value._type === 'RepAerobicInfo') {
    return info.value.repSpeed
  } else {
    return null
  }
}) // reps/minute

const minutes = computed(() => {
  if (info.value && info.value._type !== 'AnaerobicInfo') {
    return info.value.minutes
  } else {
    return null
  }
})

const distanceSpeed = computed(() => {
  if (info.value && info.value._type === 'DistanceAerobicInfo') {
    return info.value.distanceSpeed
  } else {
    return null
  }
}) // km/hr

async function fetchChallengeData() {
  const challengeDetailsResult = await _getChallengeDetails(challenge)
  if (Array.isArray(challengeDetailsResult)) {
    const challengeDetails = challengeDetailsResult[0]
    if (challengeDetails) {
      exercise.value = challengeDetails.exercise
      level.value = challengeDetails.level
      daysPerWeek.value = challengeDetails.daysPerWeek
      weeks.value = challengeDetails.weeks
      info.value = challengeDetails.info
    }
  }
  const challengeCreatorResult = await _getCreator(challenge)
  if (Array.isArray(challengeCreatorResult)) {
    const challengeCreator = challengeCreatorResult[0]
    if (challengeCreator) {
      creator.value = challengeCreator.creator
      const creatorUsernameResult = await _getUsername(creator.value)
      if (Array.isArray(creatorUsernameResult) && creatorUsernameResult[0]) {
        creatorUsername.value = creatorUsernameResult[0].username
      }
    }
  }

  const challengeNameResult = await _getChallengeName(challenge)
  if (Array.isArray(challengeNameResult) && challengeNameResult[0]) {
    name.value = challengeNameResult[0].name
  }

  const dateCreatedResult = await _getDateCreated(challenge)
  if (Array.isArray(dateCreatedResult) && dateCreatedResult[0]) {
    dateCreated.value = dateCreatedResult[0].dateCreated
    dateCreatedString.value = formatDate(dateCreated.value)
  }
  console.log('details:', challengeDetailsResult)
}

onMounted(fetchChallengeData)
</script>

<template>
  <div class="challenge-wrapper">
    <div class="challenge-info">
      <h2 class="challenge-title">{{ name }}</h2>
      <p class="creator">{{ exercise }} ⋅ Level {{ level }}</p>
      <p class="creator">Created by {{ creatorUsername }} on {{ dateCreated }}</p>
      <div class="challenge-card">
        <div class="challenge-general">
          <p><strong>Days per Week:</strong> {{ daysPerWeek }}</p>
          <p><strong>Weeks:</strong> {{ weeks }}</p>
        </div>

        <!-- Anaerobic -->
        <div v-if="category === 'anaerobic'" class="challenge-specific">
          <p v-if="weight"><strong>Weight:</strong> {{ weight }} kg</p>
          <p><strong>Reps:</strong> {{ reps }}</p>
          <p><strong>Sets:</strong> {{ sets }}</p>
        </div>

        <!-- Rep Aerobic -->
        <div v-else-if="subcategory === 'rep'" class="challenge-specific">
          <p><strong>Speed:</strong> {{ repSpeed }} reps/min</p>
          <p><strong>Duration:</strong> {{ minutes }} minutes</p>
        </div>

        <!-- Distance Aerobic -->
        <div v-else-if="subcategory === 'distance'" class="challenge-specific">
          <p><strong>Speed:</strong> {{ distanceSpeed }} km/hr</p>
          <p><strong>Duration:</strong> {{ minutes }} minutes</p>
        </div>
      </div>
    </div>
    <router-view />
  </div>
</template>

<style scoped>
.challenge-wrapper {
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.challenge-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.creator {
  font-size: 1rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.challenge-card {
  background-color: #111;
  border-radius: 16px;
  padding: 1.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  cursor: pointer;
}

.challenge-general p,
.challenge-specific p {
  margin: 0.3rem 0;
  font-size: 1rem;
}
</style>
