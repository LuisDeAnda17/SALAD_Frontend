<template>
  <div class="profile-page">

    <!-- Header -->
    <div class="profile-header">
      <div v-if="profile.userImg" class="profile-image-container">
        <img :src="profile.userImg" class="profile-image" alt="Profile Image" />
      </div>
      <div v-else class="profile-image-placeholder">
        <span>{{ profileDisplayName.charAt(0).toUpperCase() }}</span>
      </div>
      <h1>{{ profileDisplayName }}</h1>
      <p class="skill">{{ profile.skillLevel || 'No skill level set' }}</p>
    </div>

    <!-- Body -->
    <div class="profile-body">
      
      <!-- Bio -->
      <div class="profile-section">
        <h2>About Me</h2>
        <p v-if="!isEditing">{{ profile.bio || 'No bio provided yet.' }}</p>
        <textarea v-else v-model="editForm.bio" class="edit-input"></textarea>
      </div>

      <!-- Location -->
      <div class="profile-section">
        <h2>Location</h2>
        <p v-if="!isEditing">{{ profile.location || 'Unknown' }}</p>
        <input v-else v-model="editForm.location" class="edit-input" />
      </div>

      <!-- Skill Level -->
      <div class="profile-section">
        <h2>Skill Level</h2>
        <p v-if="!isEditing">{{ profile.skillLevel }}</p>
        <select v-else v-model="editForm.skillLevel" class="edit-input">
          <option value="">Select...</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </div>

      <!-- Image (only show when editing own profile) -->
      <div v-if="isOwnProfile" class="profile-section">
        <h2>Profile Image URL</h2>
        <img v-if="!isEditing" :src="profile.userImg" class="profile-image" />
        <input v-else v-model="editForm.userImg" class="edit-input" />
      </div>

      <!-- Date Joined -->
      <div class="profile-section">
        <h2>Date Joined</h2>
        <p>{{ dateJoinedFormatted }}</p>
      </div>

    </div>

    <!-- Buttons -->
    <div class="actions" v-if="isOwnProfile">
      <button v-if="!isEditing" class="edit-btn" @click="startEditing">
        Edit Profile
      </button>

      <div v-else>
        <button class="save-btn" @click="saveProfile">Save</button>
        <button class="cancel-btn" @click="cancelEditing">Cancel</button>
      </div>
    </div>

  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { profileApi } from "@/services/api/profileApi";

import type { ProfileResponse, UpdateProfileRequest } from "@/types/profile";
import type { GetUsernameResponse } from "@/types/api";

const route = useRoute();
const authStore = useAuthStore();
const currentUserId = computed(() => authStore.user?._id);
const session = computed(() => authStore.sessionId);

// Get userId from route params or use current user
const profileUserId = computed(() => {
  const paramUserId = route.params.userId as string | undefined;
  return paramUserId || currentUserId.value || "";
});

const isOwnProfile = computed(() => profileUserId.value === currentUserId.value);
const username = ref("");

type Profile = {
  location: string;
  bio: string;
  skillLevel: string;
  userImg: string;
};

const profile = ref({
  location: "My location",
  bio: "This is my bio!",
  skillLevel: "Beginner",
  dateJoined: new Date(),
  userImg: ""
});

// Editing state
const isEditing = ref(false);

// Editing form
const editForm = ref<Profile>({
  location: "",
  bio: "",
  skillLevel: "",
  userImg: ""
});

// -----------------------------
// LOAD PROFILE
// -----------------------------
const loadProfile = async () => {
  if (!profileUserId.value) return;

  try {
    const response: ProfileResponse = (await profileApi.getProfile(
      {user: profileUserId.value},
    )).data;
    if (Array.isArray(response) && response[0] && response[0].profile) {
        const profileData = response[0].profile;
        profile.value = {
            location: profileData.location ? profileData.location : "Not set",
            bio: profileData.bio ? profileData.bio : "No bio provided yet.",
            skillLevel: profileData.skillLevel ? profileData.skillLevel: "Not set",
            dateJoined: new Date(profileData.dateJoined),
            userImg: profileData.userImg || ""
        };
    }
    if (response == undefined) return;
   

    // fetch username
    const userRes: GetUsernameResponse | { status: string, error: unknown} = await authStore._getUsername(
      profileUserId.value
    );
    if (Array.isArray(userRes) && userRes[0]?.username) {
      username.value = userRes[0].username;
    }
   

  } catch (err) {
    console.error("Error loading profile:", err);
  }
};

// -----------------------------
// EDIT PROFILE
// -----------------------------
const startEditing = () => {
    if (!currentUserId.value || !isOwnProfile.value) return;
  editForm.value = {
    location: profile.value.location,
    bio: profile.value.bio,
    skillLevel: profile.value.skillLevel,
    userImg: profile.value.userImg
  };
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
};

// Save edits
const saveProfile = async () => {
if (!currentUserId.value || !session.value || !isOwnProfile.value) return;
  try {
    const updatedProfile: UpdateProfileRequest = {
      user: currentUserId.value,
      session: session.value ,
      location: (editForm.value.location !== profile.value.location && editForm.value.location !== undefined) ? editForm.value.location : profile.value.location,
      bio: (editForm.value.bio !== profile.value.bio && editForm.value.bio !== undefined) ? editForm.value.bio : profile.value.bio,
      skillLevel: (editForm.value.skillLevel !== profile.value.skillLevel && editForm.value.skillLevel !== undefined) ? editForm.value.skillLevel : profile.value.skillLevel,
      userImg: (editForm.value.userImg !== profile.value.userImg && editForm.value.userImg !== undefined) ? editForm.value.userImg : profile.value.userImg, 
    };

    console.log("Updating profile with:", updatedProfile);

    await profileApi.updateProfile(updatedProfile);

    // Update reactive profile
    await loadProfile();

    isEditing.value = false;
  } catch (err) {
    console.error("Failed to update profile:", err);
  }
};

// Computed fields
const profileDisplayName = computed(() => username.value || "Unknown");

const dateJoinedFormatted = computed(() =>
  profile.value.dateJoined.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
);

onMounted(async () => {
  await loadProfile();
});

// Reload profile when route changes
watch(() => route.params.userId, async () => {
  username.value = ""; // Reset username
  await loadProfile();
});


</script>


<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 2rem;
  background: #1c1c1c;
  border-radius: 12px;
  border: 1px solid #333;
}

.profile-image-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #444;
  background: #2a2a2a;
}

.profile-image-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #1c1c1c;
  border: 2px solid #444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 3rem;
  font-weight: 600;
  color: #eee;
}

h1 {
  color: #eee;
  margin: 1rem 0 0.5rem;
}

.skill {
  color: #aaa;
  margin-top: 4px;
  font-size: 1rem;
}

.profile-body {
  background: #1c1c1c;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #333;
}

.profile-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #333;
}

.profile-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.profile-section h2 {
  font-size: 1.2rem;
  margin-bottom: 8px;
  color: #eee;
}

.profile-section p {
  color: #ccc;
  margin: 0;
  line-height: 1.6;
}

/* Editing inputs */
.edit-input {
  width: 100%;
  padding: 0.75rem;
  margin-top: 6px;
  border: 1px solid #444;
  border-radius: 6px;
  font-size: 1rem;
  background: #2a2a2a;
  color: #eee;
}

.edit-input::placeholder {
  color: #888;
}

.edit-btn,
.save-btn,
.cancel-btn {
  display: inline-block;
  margin-top: 20px;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid;
  cursor: pointer;
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.edit-btn {
  background: rgba(37, 99, 235, 0.75);
  border-color: rgba(37, 99, 235, 0.9);
}

.edit-btn:hover {
  background: rgba(37, 99, 235, 0.85);
}

.save-btn {
  background: rgba(16, 185, 129, 0.75);
  border-color: rgba(16, 185, 129, 0.9);
  margin-right: 10px;
}

.save-btn:hover {
  background: rgba(16, 185, 129, 0.85);
}

.cancel-btn {
  background: rgba(239, 68, 68, 0.75);
  border-color: rgba(239, 68, 68, 0.9);
}

.cancel-btn:hover {
  background: rgba(239, 68, 68, 0.85);
}

.actions {
  text-align: center;
  margin-top: 2rem;
}
</style>
