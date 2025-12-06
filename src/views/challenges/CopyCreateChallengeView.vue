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
</script>

<template></template>

<style scoped></style>
