<script setup lang="ts">
import { ref, computed, onMounted, defineProps } from 'vue'
import { storeToRefs } from 'pinia'
import type { ExerciseInfo } from '@/types/challengeDefinition'
import { useAuthStore } from '@/stores/auth'
import { useChallengeVerificationStore } from '@/stores/challengeVerification'
import { useRouter } from 'vue-router'
const props = defineProps<{ verificationRequest: string; role: string }>()
const authStore = useAuthStore()
const { _getUsername } = authStore

const challengeVerificationStore = useChallengeVerificationStore()
</script>

<template></template>

<style scoped></style>
