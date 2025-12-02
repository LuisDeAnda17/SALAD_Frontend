<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useRouter } from 'vue-router'
import type {
  RepAerobicInfo,
  AnaerobicInfo,
  DistanceAerobicInfo,
} from '@/types/challengeDefinition'

const authStore = useAuthStore()

const { user, userId, sessionId } = storeToRefs(authStore)

const challengeDefinitionStore = useChallengeDefinitionStore()

const { createChallenge } = challengeDefinitionStore

const exercise = ref<string>('')
const level = ref<number>(1)
const weeks = ref<number>(0)
const daysPerWeek = ref<number>(0)
const category = ref<'aerobic' | 'anaerobic' | null>(null)
const subcategory = ref<'distance' | 'rep' | null>(null)
const weight = ref<number | null>(null) // kg
const reps = ref<number>(0)
const sets = ref<number>(0)
const repSpeed = ref<number>(0) // reps/minute
const minutes = ref<number>(0)
const distanceSpeed = ref<number>(0) // km/hr

const repAerobicInfo = computed(() => {
  if (category.value !== 'aerobic' || subcategory.value !== 'rep') {
    return null
  }
  return {
    _type: 'RepAerobicInfo',
    repSpeed: repSpeed.value,
    minutes: minutes.value,
  } as RepAerobicInfo
})

const distanceAerobicInfo = computed(() => {
  if (category.value !== 'aerobic' || subcategory.value !== 'distance') {
    return null
  }
  return {
    _type: 'DistanceAerobicInfo',
    distanceSpeed: distanceSpeed.value,
    minutes: minutes.value,
  } as DistanceAerobicInfo
})

const anaerobicInfo = computed(() => {
  if (category.value !== 'anaerobic') {
    return null
  }
  return {
    _type: 'AnaerobicInfo',
    weight: weight.value ? weight.value : undefined,
    reps: reps.value,
    sets: sets.value,
  } as AnaerobicInfo
})

const exerciseInfo = computed(() => {
  if (anaerobicInfo.value) {
    return anaerobicInfo.value
  } else if (repAerobicInfo.value) {
    return repAerobicInfo.value
  } else if (distanceAerobicInfo.value) {
    return distanceAerobicInfo.value
  }
})

async function submitChallenge() {
  if (category.value && sessionId.value && exerciseInfo.value) {
    await createChallenge(
      sessionId.value,
      exercise.value,
      daysPerWeek.value,
      weeks.value,
      level.value,
      exerciseInfo.value,
    )
  }
}
</script>

<template>
  <div class="content">
    <h1>Create Challenge</h1>

    <!-- CATEGORY SELECTION -->
    <div class="section">
      <h2>Select Category</h2>
      <div class="button-row">
        <button
          class="select-btn"
          :class="{ active: category === 'aerobic' }"
          @click="
            () => {
              category = 'aerobic'
              subcategory = null
            }
          "
        >
          Aerobic
        </button>

        <button
          class="select-btn"
          :class="{ active: category === 'anaerobic' }"
          @click="
            () => {
              category = 'anaerobic'
              subcategory = null
            }
          "
        >
          Anaerobic
        </button>
      </div>
    </div>

    <!-- SUBCATEGORY SELECTION (AEROBIC ONLY) -->
    <div v-if="category === 'aerobic'" class="section">
      <h2>Select Aerobic Type</h2>
      <div class="button-row">
        <button
          class="select-btn"
          :class="{ active: subcategory === 'distance' }"
          @click="subcategory = 'distance'"
        >
          Distance
        </button>

        <button
          class="select-btn"
          :class="{ active: subcategory === 'rep' }"
          @click="subcategory = 'rep'"
        >
          Repetition
        </button>
      </div>
    </div>

    <!-- FORM -->
    <div class="form" v-if="category && (category === 'anaerobic' || subcategory)">
      <h2>Challenge Details</h2>

      <label>Exercise Name</label>
      <input
        v-if="category === 'anaerobic'"
        v-model="exercise"
        placeholder="e.g. Squats, Pushups, Bicep Curls"
      />
      <input
        v-if="category === 'aerobic' && subcategory === 'distance'"
        v-model="exercise"
        placeholder="e.g. Running, Biking"
      />
      <input
        v-if="category === 'aerobic' && subcategory === 'rep'"
        v-model="exercise"
        placeholder="e.g. Burpees"
      />

      <label>Level</label>
      <input type="number" v-model="level" min="1" max="3" />

      <label>Weeks</label>
      <input type="number" v-model="weeks" min="1" />

      <label>Days Per Week</label>
      <input type="number" v-model="daysPerWeek" min="1" max="7" />

      <!-- ANAEROBIC FIELDS -->
      <template v-if="category === 'anaerobic'">
        <label>Weight (kg)</label>
        <input type="number" v-model="weight" min="0" />

        <label>Reps</label>
        <input type="number" v-model="reps" min="1" />

        <label>Sets</label>
        <input type="number" v-model="sets" min="1" />
      </template>

      <!-- REP AEROBIC -->
      <template v-if="category === 'aerobic' && subcategory === 'rep'">
        <label>Reps Per Minute</label>
        <input type="number" v-model="repSpeed" min="1" />

        <label>Minutes</label>
        <input type="number" v-model="minutes" min="1" />
      </template>

      <!-- DISTANCE AEROBIC -->
      <template v-if="category === 'aerobic' && subcategory === 'distance'">
        <label>Speed (km/hr)</label>
        <input type="number" v-model="distanceSpeed" min="1" />

        <label>Minutes</label>
        <input type="number" v-model="minutes" min="1" />
      </template>

      <button class="submit-btn" @click="submitChallenge">Create Challenge</button>
    </div>
  </div>
</template>

<style scoped>
/* FULL DARK THEME */
:host {
  background-color: #111;
  color: white;
  min-height: 100vh;
}

.content {
  max-width: 700px;
  margin: 0 auto;
  color: white;
}

h1 {
  font-weight: 600;
  font-size: 2.4rem;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.section {
  margin: 2rem 0;
}

.button-row {
  display: flex;
  gap: 1rem;
}

.select-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.7rem 1.4rem;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}

.select-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.select-btn.active {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
}

.form {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.08);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

label {
  font-size: 1rem;
  opacity: 0.85;
}

input {
  padding: 0.6rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.3);
  color: white;
}

.submit-btn {
  margin-top: 1rem;
  background: rgba(0, 200, 80, 0.3);
  border: 1px solid rgba(0, 200, 80, 0.5);
  padding: 0.8rem;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
}

.submit-btn:hover {
  background: rgba(0, 200, 80, 0.45);
}
</style>
