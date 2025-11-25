<script setup lang="ts">
import { computed } from "vue";
import type { User } from "@/types/api";

type ProfileUser = User & {
  bio?: string;
  mutualFriends?: number;
  isFriend?: boolean;
};

const props = defineProps<{
  user: ProfileUser;
  currentUserId?: string | null;
  requestState?: "idle" | "pending" | "sent";
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (event: "request-friend", userId: string): void;
}>();

const isSelf = computed(() => props.currentUserId === props.user?._id);
const alreadyFriends = computed(() => !!props.user?.isFriend);
const isRequestPending = computed(() => props.requestState === "pending");
const requestCompleted = computed(() => props.requestState === "sent");

const canRequest = computed(() => {
  if (!props.user || props.disabled) return false;
  return !isSelf.value && !alreadyFriends.value && !isRequestPending.value && !requestCompleted.value;
});

const actionLabel = computed(() => {
  if (alreadyFriends.value) return "Friends";
  if (isSelf.value) return "You";
  if (isRequestPending.value) return "Sending...";
  if (requestCompleted.value) return "Requested";
  return "Add friend";
});

const handleRequest = () => {
  if (!props.user || !canRequest.value) return;
  emit("request-friend", props.user._id);
};
</script>

<template>
  <article class="profile-card">
    <div class="profile-card__avatar">
      <span>{{ props.user?.username?.charAt(0)?.toUpperCase() }}</span>
    </div>
    <div class="profile-card__body">
      <div class="profile-card__header">
        <h3>{{ props.user.username }}</h3>
        <small v-if="props.user.mutualFriends !== undefined">
          {{ props.user.mutualFriends }} mutual
          {{ props.user.mutualFriends === 1 ? "friend" : "friends" }}
        </small>
      </div>
      <p v-if="props.user.bio" class="profile-card__bio">
        {{ props.user.bio }}
      </p>
    </div>
    <div class="profile-card__actions">
      <button
        class="profile-card__request"
        type="button"
        :disabled="!canRequest"
        @click="handleRequest"
      >
        {{ actionLabel }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.profile-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1.25rem;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.profile-card__avatar {
  height: 3.5rem;
  width: 3.5rem;
  border-radius: 50%;
  background: #f6f6f6;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
}

.profile-card__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
}

.profile-card__header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #000;
}

.profile-card__header small {
  color: #000;
}

.profile-card__bio {
  margin: 0.35rem 0 0;
  color: #000;
  line-height: 1.4;
}

.profile-card__actions {
  display: flex;
}

.profile-card__request {
  border: none;
  border-radius: 999px;
  padding: 0.45rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  background: #2563eb;
  color: white;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.profile-card__request:disabled {
  background: #c7cde6;
  cursor: default;
  opacity: 0.7;
}
</style>
