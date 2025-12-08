<script setup lang = "ts">
import Leaderboard from '../components/Leaderboard.vue'
import { useleaderboardStore } from '@/stores/LeaderboardStore';
import { useAuthStore } from '@/stores/auth';
import { ref, onMounted } from 'vue';

const title = "Leaderboard";
const leaderboardStore = useleaderboardStore();
const authStore = useAuthStore();

const players = ref<{ name: string; score: number }[]>([
  { name: "Alice", score: 150 },
  { name: "Bob", score: 120 },
  { name: "Charlie", score: 100 },
  { name: "David", score: 80 },
  { name: "Eve", score: 60 },
]);

try{
  const storedPlayers = localStorage.getItem('leaderboardPlayers');
  if (storedPlayers) {
    const parsedPlayers = JSON.parse(storedPlayers);
    if (Array.isArray(parsedPlayers)) {
      players.value = parsedPlayers;
    }
  }
} catch (error) {
  console.error("Error retrieving leaderboard data from localStorage:", error);
}

onMounted(async () => {
  // get all users
  const allusers = ref<string[]>([]);
  try {
    const allusersResponse = await authStore.getAllUsers();
    if (allusersResponse) {
      allusers.value = allusersResponse.map(user => user.user);
    }
    console.log("All users fetched:", allusers);
  } catch (error) {
    console.error("Error getting users:", error);
  }

  // Fetch and update leaderboard data
    try {
    const response = await leaderboardStore._fetchUserRankings(allusers.value);
    console.log("Leaderboard data fetched:", response);

    // ensure response is an array before mapping
    if (!Array.isArray(response)) {
      console.error("Unexpected leaderboard response:", response);
    } else {
      // Update local players array
      const renamedFields = response.map(user => ({
        name: user.user,
        score: user.points,
      }));

      // resolve usernames and guarantee `name` is a string
      players.value = await Promise.all(renamedFields.map(async (player) => {
        const usernameResponse = await authStore._getUsername(player.name);
        if (!Array.isArray(usernameResponse) || usernameResponse.length === 0) {
          return {
            name: player.name,
            score: player.score,
          };
        } else {
          return {
            // use fallback to ensure `name` is `string`
            name: usernameResponse[0]?.username ?? player.name,
            score: player.score,
          };
        }
      }));

      // Store in localStorage
      localStorage.setItem('leaderboardPlayers', JSON.stringify(players.value));
    }
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
  }
});

// Ensure it's sorted before passing:
// players1.sort((a, b) => b.score - a.score);
// players2.sort((a, b) => b.score - a.score);
</script>

<template>
  <div class="leaderboard-view">
    <Leaderboard :items="players" title="Top Scores" />
  </div>
</template>

<style scoped> 
.leaderboard-view {
  max-width: 600px;
  margin: 0 auto;
  align-items: center;
  display: flex;
  flex-direction: column;
}
</style>
