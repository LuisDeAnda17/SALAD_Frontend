<script setup lang = "ts">
import Leaderboard from '../components/Leaderboard.vue'

const title = "Leaderboard";

const players = [
  { name: "Alice", score: 150 },
  { name: "Bob", score: 120 },
  { name: "Charlie", score: 100 },
  { name: "David", score: 80 },
  { name: "Eve", score: 60 },
];

// Ensure it's sorted before passing:
// players1.sort((a, b) => b.score - a.score);
// players2.sort((a, b) => b.score - a.score);
</script>

<template>
  <Leaderboard :items="players" title="Top Scores" />
</template>
