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
</script>

<template></template>

<style scoped>
/* FULL DARK THEME */

.content {
  margin: 0;
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
