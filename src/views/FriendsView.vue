<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed, reactive } from "vue";
import ProfilePage from "@/components/Profile-Page.vue";
import ChatPopup from "@/components/ChatPopup.vue";
import { useAuthStore } from "@/stores/auth";
import { friendingApi } from "@/services/api/friendingApi";
import { authApi } from "@/services/api/authApi";
import { chatApi } from "@/services/api/chatApi";
import type {
  User,
  GetFriendsResponse,
  GetFriendRequestsResponse,
} from "@/types/friending";
import type { GetChatsResponse } from "@/types/chat";

type FriendWithUsername = User;

type PendingRequestWithUsername = {
  _id: string;
  requester: User;
  receiver: string;
};

type SentRequestWithUsername = {
  _id: string;
  requester: string;
  receiver: User;
};

const authStore = useAuthStore();

const friends = ref<FriendWithUsername[]>([]);
const pendingRequests = ref<PendingRequestWithUsername[]>([]);
const sentRequests = ref<SentRequestWithUsername[]>([]);
const loading = reactive({
  friends: false,
  requests: false,
  sentRequests: false,
});
const pageError = ref<string | null>(null);
const requestActionState = reactive<Record<string, "idle" | "accepting" | "declining">>({});

// Track existing chats keyed by friend user ID
const existingChatIds = reactive<Record<string, string>>({});

// Chat popup state
const chatPopupOpen = ref(false);
const chatOtherUser = ref<{ id: string; username: string } | null>(null);
const chatId = ref<string | null>(null);

const isAuthenticated = computed(() => !!authStore.userId);

const handleError = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    pageError.value = error.message;
  } else {
    pageError.value = fallback;
  }
};

const updateExistingChatsForFriends = async () => {
  const currentUserId = authStore.userId;
  if (!currentUserId) return;

  const checks = friends.value.map(async (friend) => {
    try {
      const { data } = await chatApi.getChats({
        userA: currentUserId,
        userB: friend._id,
      });

      if (Array.isArray(data)) {
        const chats = (data as (GetChatsResponse | { error: string })[]).filter(
          (item): item is GetChatsResponse => !("error" in item)
        );
        if (chats.length > 0 && chats[0]) {
          // Store the first chat ID for this friend
          existingChatIds[friend._id] = chats[0].chat;
        }
      }
    } catch {
      // Ignore chat lookup failures
    }
  });

  await Promise.all(checks);
};

const fetchFriends = async () => {
  if (!authStore.userId) {
    friends.value = [];
    return;
  }
  loading.friends = true;
  try {
    const { data } = await friendingApi.getFriends({ user: authStore.userId });
    const friendResponses = data || [];
    
    // Fetch usernames for each friend ID
    const friendPromises = friendResponses.map(async (friendResponse: GetFriendsResponse) => {
      try {
        console.log("friendResponse", friendResponse);
        const { data: usernameResponse } = await authApi._getUsername({ user: friendResponse.friend });
        return {
          _id: friendResponse.friend,
          username: usernameResponse[0]?.username || "Unknown",
        } as FriendWithUsername;
      } catch (error) {
        return {
          _id: friendResponse.friend,
          username: "Unknown",
        } as FriendWithUsername;
      }
    });
    
    friends.value = await Promise.all(friendPromises);

    // After loading friends, check for existing chats with each friend
    await updateExistingChatsForFriends();
  } catch (error) {
    handleError(error, "Unable to load friends.");
  } finally {
    loading.friends = false;
  }
};

const fetchPendingRequests = async () => {
  if (!authStore.userId) {
    pendingRequests.value = [];
    return;
  }
  loading.requests = true;
  try {
    const { data } = await friendingApi.getReceivedRequests({ user: authStore.userId });
    const requestResponses = data || [];
    
    // Fetch request info and usernames for each requester
    const requestPromises = requestResponses.map(async (requestResponse: GetFriendRequestsResponse) => {
      try {
        // Get requester/receiver IDs for this friend request
        const { data: requestInfo } = await friendingApi.getRequestInfo({
          friendRequest: requestResponse.friendRequest,
        });

        // For received requests, the other user is the requester
        const { requester, receiver } = requestInfo[0]||{requester: "", receiver: ""};

        console.log("requester", requester);
        const { data: usernameResponse } = await authApi._getUsername({
          user: requester,
        });

        return {
          _id: requestResponse.friendRequest,
          requester: {
            _id: requester,
            username: usernameResponse[0]?.username || "Unknown",
          },
          receiver,
        } as PendingRequestWithUsername;
      } catch (error) {
        return {
          _id: requestResponse.friendRequest,
          requester: {
            _id: authStore.userId!,
            username: "Unknown",
          },
          receiver: authStore.userId!,
        } as PendingRequestWithUsername;
      }
    });
    
    pendingRequests.value = await Promise.all(requestPromises);
  } catch (error) {
    handleError(error, "Unable to load friend requests.");
  } finally {
    loading.requests = false;
  }
};

const fetchSentRequests = async () => {
  if (!authStore.userId) {
    sentRequests.value = [];
    return;
  }
  loading.sentRequests = true;
  try {
    const { data } = await friendingApi.getSentRequests({ user: authStore.userId });
    console.log("data", data);
    const requestResponses = data || [];
    
    // Fetch request info and usernames for each receiver
    const requestPromises = requestResponses.map(async (requestResponse: GetFriendRequestsResponse) => {
      try {
        // Get requester/receiver IDs for this friend request
        const { data: requestInfo } = await friendingApi.getRequestInfo({
          friendRequest: requestResponse.friendRequest,
        });
        console.log("requestInfo", requestInfo);

        const { requester, receiver } = requestInfo[0]||{requester: "", receiver: ""};
        console.log("receiver", receiver);

        const { data: usernameResponse } = await authApi._getUsername({
          user: receiver,
        });
        console.log("usernameResponse", usernameResponse);

        return {
          _id: requestResponse.friendRequest,
          requester,
          receiver: {
            _id: receiver,
            username: usernameResponse[0]?.username || "Unknown",
          },
        } as SentRequestWithUsername;
      } catch (error) {
        return {
          _id: requestResponse.friendRequest,
          requester: authStore.userId!,
          receiver:
          {
            _id: authStore.userId!,
            username: "Unknown",
          },
        } as SentRequestWithUsername;
      }
    });
    
    sentRequests.value = await Promise.all(requestPromises);
  } catch (error) {
    handleError(error, "Unable to load sent friend requests.");
  } finally {
    loading.sentRequests = false;
  }
};

const refreshData = () => {
  fetchFriends();
  fetchPendingRequests();
  fetchSentRequests();
};

const acceptRequest = async (request: PendingRequestWithUsername) => {
  if (!authStore.userId) return;
  requestActionState[request._id] = "accepting";
  try {
    await friendingApi.acceptFriend({
      user: authStore.userId,
      requester: request.requester._id,
    });
    await refreshData();
  } catch (error) {
    handleError(error, "Unable to accept request.");
  } finally {
    requestActionState[request._id] = "idle";
  }
};

const declineRequest = async (request: PendingRequestWithUsername) => {
  if (!authStore.userId) return;
  requestActionState[request._id] = "declining";
  try {
    await friendingApi.removeFriend({
      user: authStore.userId,
      requester: request.requester._id,
    });
    await refreshData();
  } catch (error) {
    handleError(error, "Unable to decline request.");
  } finally {
    requestActionState[request._id] = "idle";
  }
};

const cancelSentRequest = async (request: SentRequestWithUsername) => {
  if (!authStore.userId) return;
  requestActionState[request._id] = "declining";
  try {
    // Note: This uses removeFriend endpoint - backend may need a specific cancel request endpoint
    await friendingApi.removeFriend({
      user: authStore.userId,
      requester: request.receiver._id,
    });
    await refreshData();
  } catch (error) {
    handleError(error, "Unable to cancel request.");
  } finally {
    requestActionState[request._id] = "idle";
  }
};

const removeFriend = async (userId: string) => {
  if (!authStore.userId) return;
  
  if (!confirm("Are you sure you want to remove this friend?")) {
    return;
  }
  
  try {
    await friendingApi.removeFriend({
      user: authStore.userId,
      requester: userId,
    });
    await refreshData();
  } catch (error) {
    handleError(error, "Unable to remove friend.");
  }
};

const startChat = async (userId: string) => {
  if (!authStore.userId) {
    pageError.value = "You need to log in before starting a chat.";
    return;
  }

  try {
    // Find the friend profile to get their username
    const friendProfile = friends.value.find((f) => f._id === userId);
    if (!friendProfile) {
      pageError.value = "User not found";
      return;
    }

    // If we already know about an existing chat, just open it
    const existingChatId = existingChatIds[userId];
    if (existingChatId) {
      chatOtherUser.value = {
        id: userId,
        username: friendProfile.username,
      };
      chatId.value = existingChatId;
      chatPopupOpen.value = true;
      pageError.value = null;
      return;
    }

    // Otherwise, start or get the chat
    const startResponse = await chatApi.startChat({
      requester: authStore.userId,
      receiver: userId,
    });

    if (startResponse.data && "error" in startResponse.data) {
      pageError.value = startResponse.data.error;
      return;
    }

    // Get the chat ID - try from startChat response first, then getChats
    let chatIdValue: string | null = null;

    if (startResponse.data && "chat" in startResponse.data) {
      chatIdValue = startResponse.data.chat;
    } else {
      try {
        const chatResponse = await chatApi.getChats({
          userA: authStore.userId,
          userB: userId,
        });

        if (Array.isArray(chatResponse.data)) {
          const chats = (chatResponse.data as (GetChatsResponse | { error: string })[]).filter(
            (item): item is GetChatsResponse => !("error" in item)
          );
          chatIdValue = chats.length > 0 && chats[0] ? chats[0].chat : null;
        }
      } catch (err) {
        console.error("Failed to get chat ID:", err);
      }
    }

    // Open the chat popup
    chatOtherUser.value = {
      id: userId,
      username: friendProfile.username,
    };
    chatId.value = chatIdValue;
    // Remember this chat for future "Open Chat" actions
    if (chatIdValue) {
      existingChatIds[userId] = chatIdValue;
      // Notify other components (including other users' views) that a chat was created
      // This allows user 2's view to update when user 1 starts a chat with them
      window.dispatchEvent(
        new CustomEvent("chat-created", {
          detail: {
            chatId: chatIdValue,
            requester: authStore.userId,
            receiver: userId,
          },
        })
      );
    }
    chatPopupOpen.value = true;
    pageError.value = null;
  } catch (error) {
    pageError.value =
      error instanceof Error ? error.message : "Unable to start chat.";
  }
};

const closeChatPopup = () => {
  chatPopupOpen.value = false;
  chatOtherUser.value = null;
  chatId.value = null;
};

// Handle chat creation events to update cache when another user starts a chat with current user
const handleChatCreated = (event: CustomEvent<{ chatId: string; requester: string; receiver: string }>) => {
  const { chatId, requester, receiver } = event.detail;
  const currentUserId = authStore.userId;
  
  // If this chat was created with the current user (they are the receiver), update the cache
  if (currentUserId && receiver === currentUserId && requester) {
    existingChatIds[requester] = chatId;
  }
  // If the current user created this chat (they are the requester), update the cache
  else if (currentUserId && requester === currentUserId && receiver) {
    existingChatIds[receiver] = chatId;
  }
};

onMounted(() => {
  if (authStore.userId) {
    refreshData();
  }
  // Listen for chat creation events
  window.addEventListener("chat-created", handleChatCreated as EventListener);
});

onUnmounted(() => {
  // Clean up event listener
  window.removeEventListener("chat-created", handleChatCreated as EventListener);
});

watch(
  () => authStore.userId,
  (nextId, prevId) => {
    if (nextId && nextId !== prevId) {
      refreshData();
    } else if (!nextId) {
      friends.value = [];
      pendingRequests.value = [];
      sentRequests.value = [];
    }
  }
);
</script>

<template>
  <section class="friends">
    <header class="friends__header">
      <div>
        <p class="friends__eyebrow">Your network</p>
        <h1>Friends & requests</h1>
        <p class="friends__subtitle">
          Keep track of accepted friends and respond to incoming invitations.
        </p>
      </div>
      <button
        class="friends__refresh"
        type="button"
        @click="refreshData"
        :disabled="loading.friends || loading.requests || loading.sentRequests"
      >
        Refresh
      </button>
    </header>

    <div v-if="pageError" class="friends__error">
      {{ pageError }}
    </div>

    <div v-if="!isAuthenticated" class="friends__empty">
      <p>Please log in to see your friends and requests.</p>
    </div>

    <div v-else class="friends__columns">
      <section class="friends__panel">
        <header>
          <h2>Friends</h2>
          <small v-if="!loading.friends">{{ friends.length }} total</small>
        </header>
        <div v-if="loading.friends" class="friends__state">Loading friends…</div>
        <div v-else-if="friends.length === 0" class="friends__state">
          You have not added any friends yet.
        </div>
        <div v-else class="friends__list">
          <ProfilePage
            v-for="friend in friends"
            :key="friend._id"
            :user="friend"
            :current-user-id="authStore.userId"
            :has-existing-chat="!!existingChatIds[friend._id]"
            :show-remove-button="true"
            @start-chat="startChat"
            @remove-friend="removeFriend"
          />
        </div>
      </section>

      <section class="friends__panel">
        <header>
          <h2>Received requests</h2>
          <small v-if="!loading.requests">{{ pendingRequests.length }} pending</small>
        </header>
        <div v-if="loading.requests" class="friends__state">Loading requests…</div>
        <div v-else-if="pendingRequests.length === 0" class="friends__state">
          No incoming requests right now.
        </div>
        <ul v-else class="friends__requests">
          <li v-for="request in pendingRequests" :key="request._id" class="request-card">
            <div>
              <p class="request-card__name">{{ request.requester.username }}</p>
            </div>
            <div class="request-card__actions">
              <button
                type="button"
                class="request-card__btn request-card__btn--accept"
                :disabled="requestActionState[request._id] === 'accepting'"
                @click="acceptRequest(request)"
              >
                {{ requestActionState[request._id] === "accepting" ? "Accepting…" : "Accept" }}
              </button>
              <button
                type="button"
                class="request-card__btn request-card__btn--decline"
                :disabled="requestActionState[request._id] === 'declining'"
                @click="declineRequest(request)"
              >
                {{ requestActionState[request._id] === "declining" ? "Declining…" : "Decline" }}
              </button>
            </div>
          </li>
        </ul>
      </section>

      <section class="friends__panel">
        <header>
          <h2>Sent requests</h2>
          <small v-if="!loading.sentRequests">{{ sentRequests.length }} pending</small>
        </header>
        <div v-if="loading.sentRequests" class="friends__state">Loading sent requests…</div>
        <div v-else-if="sentRequests.length === 0" class="friends__state">
          No sent requests right now.
        </div>
        <ul v-else class="friends__requests">
          <li v-for="request in sentRequests" :key="request._id" class="request-card">
            <div>
              <p class="request-card__name">{{ request.receiver.username }}</p>
              <p class="request-card__time">Waiting for response</p>
            </div>
            <div class="request-card__actions">
              <button
                type="button"
                class="request-card__btn request-card__btn--decline"
                :disabled="requestActionState[request._id] === 'declining'"
                @click="cancelSentRequest(request)"
              >
                {{ requestActionState[request._id] === "declining" ? "Canceling…" : "Cancel" }}
              </button>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </section>

  <ChatPopup
    v-if="chatPopupOpen && chatOtherUser && authStore.userId"
    :other-user-id="chatOtherUser.id"
    :other-username="chatOtherUser.username"
    :current-user-id="authStore.userId"
    :chat-id="chatId"
    @close="closeChatPopup"
  />
</template>

<style scoped>
.friends {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.friends__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.friends__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  color: #6366f1;
  margin: 0 0 0.25rem;
}

.friends__subtitle {
  margin: 0.35rem 0 0;
  color: #eee;
}

h1 {
  color: #eee;
  margin: 0.5rem 0;
}

.friends__refresh {
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

.friends__refresh:hover:not(:disabled) {
  background: rgba(37, 99, 235, 0.85);
}

.friends__columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.friends__panel {
  border: 1px solid #333;
  border-radius: 12px;
  padding: 16px;
  background: #1c1c1c;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.friends__panel header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
}

.friends__panel header h2 {
  color: #eee;
  margin: 0;
}

.friends__panel header small {
  color: #aaa;
}

.friends__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.friends__requests {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.friends__state,
.friends__empty,
.friends__error {
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
}

.friends__state {
  border: 1px dashed #444;
  color: #aaa;
  background: #2a2a2a;
}

.friends__empty {
  border: 1px dashed #555;
  color: #aaa;
  background: #2a2a2a;
}

.friends__error {
  background: rgba(239, 68, 68, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(239, 68, 68, 0.5);
}

.request-card {
  border: 1px solid #333;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  min-width: 0; /* Prevent flex overflow */
  background: #2a2a2a;
  margin-bottom: 8px;
}

.request-card > div:first-child {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.request-card__name {
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: #eee;
}

.request-card__time {
  margin: 0;
  color: #aaa;
  font-size: 0.875rem;
}

.request-card__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.request-card__btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.request-card__btn--accept {
  background: rgba(16, 185, 129, 0.75);
  color: white;
  border-color: rgba(16, 185, 129, 0.9);
}

.request-card__btn--accept:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.85);
}

.request-card__btn--decline {
  background: rgba(239, 68, 68, 0.75);
  color: white;
  border-color: rgba(239, 68, 68, 0.9);
}

.request-card__btn--decline:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.85);
}

.friends__refresh:disabled,
.request-card__btn:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>

