<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useChallengeProgressStore } from '@/stores/challengeProgress'
import { useChallengeVerificationStore } from '@/stores/challengeVerification'
import { useRoute } from 'vue-router'

const route = useRoute()
const challenge = route.params.challenge as string
const part = route.params.challenge as string
const day = route.params.day as string
const week = route.params.day as string

const challengeVerificationStore = useChallengeVerificationStore()
const authStore = useAuthStore()
const challengeDefinitionStore = useChallengeDefinitionStore()

const { createVerificationRequest } = challengeVerificationStore
</script>

<template>
  <h2>Create Verification Request</h2>
</template>

<style scoped></style>
