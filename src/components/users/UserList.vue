<script setup lang="ts">
import UserCard from './UserCard.vue'

const props = defineProps<{ users: Array<{ user: string }> }>()

// Emit when a user is clicked
const emit = defineEmits<{
  (e: 'select', userId: string): void
}>()

function selectUser(id: string) {
  emit('select', id)
}
</script>

<template>
  <div class="usercard-panel">
    <UserCard v-for="u in users" :key="u.user" :user="u.user" @click="selectUser(u.user)" />
  </div>
</template>

<style scoped>
.usercard-panel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;

  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.5rem;
  background: #282828;

  min-width: 120px;
}
</style>
