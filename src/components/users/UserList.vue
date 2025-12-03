<script setup lang="ts">
import UserCard from './UserCard.vue'
import { ref, computed, onMounted, defineProps } from 'vue'
const props = defineProps<{ users: Array<any> }>()
</script>
<template>
  <div>
    <UserCard v-for="u in users" :key="u.user" :user="u.user" />
  </div>
</template>
<style scoped></style>
