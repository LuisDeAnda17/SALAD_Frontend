<template>
  <button @click="toggleView">
    Switch to {{ desiredView === 'friends' ? 'Global' : 'Friends' }} Leaderboard
  </button>
  <div v-if="desiredView === 'friends'">
    <LeaderboardFriendsView />
  </div>
  <div v-else-if="desiredView === 'global'">
    <LeaderboardGlobalView />
  </div>
</template>

<script setup lang="ts">
import LeaderboardGlobalView from './LeaderboardGlobalView.vue';
import LeaderboardFriendsView from './LeaderboardFriendsView.vue';
import { ref } from 'vue';

const desiredView = ref<'friends' | 'global'>('global'); // Change to 'friends' to view friends leaderboard

function toggleView() {
  desiredView.value = desiredView.value === 'friends' ? 'global' : 'friends';
}
</script>