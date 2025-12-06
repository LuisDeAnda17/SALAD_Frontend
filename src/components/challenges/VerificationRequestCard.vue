<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import type { ExerciseInfo } from '@/types/challengeDefinition'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useChallengeVerificationStore } from '@/stores/challengeVerification'
import { useRouter } from 'vue-router'
const props = defineProps<{ verificationRequest: string; role: string }>()
const authStore = useAuthStore()
const { _getUsername } = authStore
const challengeVerificationStore = useChallengeVerificationStore()
const { _getRequestDetails } = challengeVerificationStore
const challengeDefinitionStore = useChallengeDefinitionStore()
const { _getChallengeDetails } = challengeDefinitionStore

const challenge = ref<string>('')
const exercise = ref<string>('')
const level = ref<string>('')
const day = ref<string>('')
const week = ref<string>('')
const requester = ref<string>('')
const requesterUsername = ref<string>('')
</script>

<template>
  <div class="card">
    <h3>{{ exercise }} ⋅ Level {{ level }}</h3>
    <h4>Week {{ week }} Day {{ day }}</h4>
    <h4>requested by {{ requesterUsername }}</h4>
  </div>
</template>

<style scoped></style>
