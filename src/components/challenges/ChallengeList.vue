<script setup lang="ts">
import ChallengeCard from './ChallengeCard.vue'
import { ref, computed, onMounted, defineProps } from 'vue'
const props = defineProps<{ challenges: Array<any> }>()
</script>
<template>
  <div>
    <ChallengeCard v-for="c in challenges" :key="c.id" :challenge="c" />
  </div>
</template>
