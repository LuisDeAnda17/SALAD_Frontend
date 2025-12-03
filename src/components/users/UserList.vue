<script setup lang="ts">
import UserCard from './UserCard.vue'
import { ref, computed, onMounted, defineProps } from 'vue'
const props = defineProps<{ users: Array<any> }>()
</script>
<template>
  <div class="usercard-panel">
    <UserCard v-for="u in users" :key="u.user" :user="u.user" />
  </div>
</template>
<style scoped>
.usercard-panel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  /* Scroll behavior */
  max-height: 400px; /* adjust as needed to fit your larger page */
  overflow-y: auto;
  padding-right: 4px; /* prevents scrollbar overlap */

  /* Optional styling */
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.5rem;
  background: #282828;

  min-width: 120px;
}
</style>
