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
  hasExistingChat?: boolean;
  showRemoveButton?: boolean;
}>();

const emit = defineEmits<{
  (event: "request-friend", userId: string): void;
  (event: "start-chat", userId: string): void;
  (event: "remove-friend", userId: string): void;
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

const chatLabel = computed(() => {
  return props.hasExistingChat ? "Open Chat" : "Start Chat";
});

const handleStartChat = () => {
  if (!props.user || isSelf.value) return;
  emit("start-chat", props.user._id);
};

const handleRemoveFriend = () => {
  if (!props.user || isSelf.value) return;
  emit("remove-friend", props.user._id);
};
</script>

<template>
  <article class="profile-card">
    <div class="profile-card__avatar-section">
      <div class="profile-card__avatar">
        <span>{{ props.user?.username?.charAt(0)?.toUpperCase() }}</span>
      </div>
      <h3 class="profile-card__username">{{ props.user.username }}</h3>
    </div>
    <div class="profile-card__body">
      <div class="profile-card__header">
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
        v-if="showRemoveButton"
        class="profile-card__remove"
        type="button"
        @click="handleRemoveFriend"
      >
        Remove friend
      </button>
      <button
        v-else
        class="profile-card__request"
        type="button"
        :disabled="!canRequest"
        @click="handleRequest"
      >
        {{ actionLabel }}
      </button>
      <button
        v-if="!isSelf"
        class="profile-card__chat"
        type="button"
        @click="handleStartChat"
      >
        {{ chatLabel }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.profile-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: start;
  padding: 1.25rem;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-width: 0; /* Prevent grid overflow */
}

.profile-card__avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
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
  flex-shrink: 0;
}

.profile-card__username {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #000;
  text-align: center;
  word-break: break-word;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-card__body {
  flex: 1;
  min-width: 0;
  overflow: hidden; /* Prevent text overflow */
}

.profile-card__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
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
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
  flex-shrink: 0; /* Prevent buttons from being compressed */
}

.profile-card__request {
  padding: 0.5rem 1rem;
  background: rgba(37, 99, 235, 0.75);
  color: white;
  border: 1px solid rgba(37, 99, 235, 0.9);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.profile-card__request:hover:not(:disabled) {
  background: rgba(37, 99, 235, 0.85);
}

.profile-card__request:disabled {
  background: rgba(199, 205, 230, 0.5);
  border-color: rgba(199, 205, 230, 0.7);
  cursor: default;
  opacity: 0.7;
}

.profile-card__chat {
  padding: 0.5rem 1rem;
  background: rgba(16, 185, 129, 0.75);
  color: white;
  border: 1px solid rgba(16, 185, 129, 0.9);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.profile-card__chat:hover {
  background: rgba(16, 185, 129, 0.85);
}

.profile-card__remove {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.75);
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.9);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.profile-card__remove:hover {
  background: rgba(239, 68, 68, 0.85);
}
</style>
