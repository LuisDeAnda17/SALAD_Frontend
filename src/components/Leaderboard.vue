<template>
  <div class="leaderboard">
    <h2 class="title">{{ title }}</h2>

    <ul class="leaderboard-list">
      <li
        v-for="(player, index) in items"
        :key="player.id || index"
        class="leaderboard-item"
      >
        <span class="rank">{{ index + 1 }}</span>
        <span class="name">{{ player.name }}</span>
        <span class="score">{{ player.score }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  /**
   * Sorted list of items:
   * [
   *   { id: 1, name: "Alice", score: 120 },
   *   { id: 2, name: "Bob", score: 90 }
   * ]
   */
  items: {
    type: Array,
    required: true,
  },

  title: {
    type: String,
    default: "Leaderboard",
  }
});
</script>

<style scoped>
.leaderboard {
  width: 300px;
  border-radius: 12px;
  padding: 16px;
  background: #f5f5f5;
}

.title {
  margin-bottom: 12px;
  text-align: center;
}

.leaderboard-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.leaderboard-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  margin-bottom: 8px;
  border-radius: 6px;
}

.rank {
  font-weight: bold;
  width: 24px;
}
</style>
