<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useChallengesStore } from '@/stores/challenges'
import { useRouter } from 'vue-router'
</script>

<template>
  <h1>Challenges</h1>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}
</style>
