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

      <!-- Image -->
      <div class="profile-section">
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
    <div class="actions">
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
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { profileApi } from "@/services/api/profileApi";

import type { ProfileResponse, UpdateProfileRequest } from "@/types/profile";
import type { GetUsernameResponse } from "@/types/api";

const authStore = useAuthStore();
const userId = computed(() => authStore.user?._id);
const session = computed(() => authStore.sessionId);
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
  if (!userId.value || !session.value) return;

  try {
    const response: ProfileResponse = (await profileApi.getProfile(
      {user: userId.value},
    )).data;
    if (Array.isArray(response) && response[0] && response[0].profile) {
        const profileData = response[0].profile;
        profile.value = {
            location: profileData.location ? profileData.location : "My location",
            bio: profileData.bio ? profileData.bio : "My bio",
            skillLevel: profileData.skillLevel ? profileData.skillLevel: "Beginner",
            dateJoined: new Date(profileData.dateJoined),
            userImg: profileData.userImg || "https://via.placeholder.com/120"
        };
    }
    if (response == undefined) return;
   

    // fetch username if needed
    if (!username.value) {
      const userRes: GetUsernameResponse | { status: string, error: unknown} = await authStore._getUsername(
        userId.value
      );
      if (Array.isArray(userRes) && userRes[0]?.username) {
        username.value = userRes[0].username;
      }
    }
   

  } catch (err) {
    console.error("Error loading profile:", err);
  }
};

// -----------------------------
// EDIT PROFILE
// -----------------------------
const startEditing = () => {
    if (!userId.value) return;
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
if (!userId.value || !session.value) return;
  try {
    const updatedProfile: UpdateProfileRequest = {
      user: userId.value,
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

/* Editing inputs */
.edit-input {
  width: 100%;
  padding: 8px;
  margin-top: 6px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

.edit-btn,
.save-btn,
.cancel-btn {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: white;
  font-weight: 600;
}

.edit-btn {
  background: #0078ff;
}

.save-btn {
  background: #28a745;
  margin-right: 10px;
}

.cancel-btn {
  background: #dc3545;
}

.actions {
  text-align: center;
}
</style>
