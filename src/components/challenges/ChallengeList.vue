<script setup lang="ts">
import ChallengeCard from './ChallengeCard.vue'
import { ref, computed, onMounted } from 'vue'
const props = defineProps<{ challenges: Array<any>; role: string }>()
</script>
<template>
  <div class="challenge-list-wrapper">
    <ChallengeCard
      v-for="c in challenges"
      :key="c.challenge"
      :challenge="c.challenge"
      :role="role"
    />
  </div>
</template>
<style scoped>
.challenge-list-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  gap: 2rem;
}
</style>
