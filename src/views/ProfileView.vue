<template>
  <div class="profile-page">

    <!-- Header -->
    <div class="profile-header">
      <img :src="profile.userImg" class="profile-image" alt="Profile Image" />
      <h1>{{ profileDisplayName }}</h1>
      <p class="skill">{{ profile.skillLevel || 'No skill level set' }}</p>
    </div>

    <!-- Body -->
    <div class="profile-body">
      <div class="profile-section">
        <h2>About Me</h2>
        <p>{{ profile.bio || 'No bio provided yet.' }}</p>
      </div>

      <div class="profile-section">
        <h2>Location</h2>
        <p>{{ profile.location || 'Unknown' }}</p>
      </div>

      <div class="profile-section">
        <h2>Date Joined</h2>
        <p>{{ dateJoinedFormatted }}</p>
      </div>
    </div>

    <!-- Edit Button (just UI for now) -->
    <button class="edit-btn">
      Edit Profile
    </button>

  </div>
</template>


<script setup lang="ts">
import { ref, computed } from 'vue';

// -----------------------------
// Dummy Data (Replace via API)
// -----------------------------
const profile = ref({
  location: "Cambridge, MA",
  bio: "I love puzzles, coding, and boba.",
  skillLevel: "Intermediate",
  dateJoined: new Date("2024-10-05"),
  userImg: "https://via.placeholder.com/120"
});

// -------------------------------------
// Derived values (API-ready formatting)
// -------------------------------------
const profileDisplayName = "John Doe (TEMP NAME)"; // Replace with API user name

const dateJoinedFormatted = computed(() => {
  const d = new Date(profile.value.dateJoined);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});
</script>


<style scoped>
.profile-page {
  max-width: 700px;
  margin: 40px auto;
  padding: 20px;
  font-family: system-ui, sans-serif;
}

.profile-header {
  text-align: center;
  margin-bottom: 32px;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 9999px;
  object-fit: cover;
}

.skill {
  color: #666;
  margin-top: 4px;
}

.profile-section {
  margin-bottom: 24px;
}

.profile-section h2 {
  font-size: 1.2rem;
  margin-bottom: 6px;
}

.edit-btn {
  display: block;
  margin: 0 auto;
  padding: 10px 16px;
  border-radius: 6px;
  background: #0078ff;
  color: white;
  cursor: pointer;
  border: none;
}
</style>
