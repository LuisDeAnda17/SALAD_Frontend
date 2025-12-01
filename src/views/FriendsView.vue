<script setup lang="ts">
import { onMounted, ref, watch, computed, reactive } from "vue";
import ProfilePage from "@/components/Profile-Page.vue";
import { useAuthStore } from "@/stores/auth";
import { friendingApi } from "@/services/api/friendingApi";
import { authApi } from "@/services/api/authApi";
import type {
  User,
  GetFriendsResponse,
  GetFriendRequestsResponse,
} from "@/types/friending";

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

const isAuthenticated = computed(() => !!authStore.userId);

const handleError = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    pageError.value = error.message;
  } else {
    pageError.value = fallback;
  }
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
        const { data: usernameResponse } = await authApi.getUsername({ user: friendResponse.friend });
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
        const { data: usernameResponse } = await authApi.getUsername({
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

        const { data: usernameResponse } = await authApi.getUsername({
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

onMounted(() => {
  if (authStore.userId) {
    refreshData();
  }
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
      <button class="friends__refresh" type="button" @click="refreshData" :disabled="loading.friends || loading.requests || loading.sentRequests">
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
            disabled
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
</template>

<style scoped>
.friends {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
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
  color: #ffffff;
}

.friends__refresh {
  border: 1px solid #cbd5f5;
  background: white;
  color: #1f2937;
  border-radius: 999px;
  padding: 0.5rem 1.25rem;
  cursor: pointer;
}

.friends__columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.friends__panel {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 1.5rem;
  background: #fff;
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
  color: #000;
}

.friends__panel header small {
  color: #000;
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
  border: 1px dashed #d6d8e7;
  color: #000;
}

.friends__empty {
  border: 1px dashed #fcd34d;
  color: #92400e;
}

.friends__error {
  background: #fee2e2;
  color: #b91c1c;
}

.request-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.request-card__name {
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: #000;
}

.request-card__time {
  margin: 0;
  color: #000;
  font-size: 0.875rem;
}

.request-card__actions {
  display: flex;
  gap: 0.5rem;
}

.request-card__btn {
  border-radius: 999px;
  padding: 0.35rem 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.request-card__btn--accept {
  background: #10b981;
  color: white;
}

.request-card__btn--decline {
  background: #fee2e2;
  color: #b91c1c;
}

.friends__refresh:disabled,
.request-card__btn:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>

