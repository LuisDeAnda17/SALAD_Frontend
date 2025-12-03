<script setup lang="ts">
import { onMounted, ref, computed, reactive } from "vue";
import ProfilePage from "@/components/Profile-Page.vue";
import ChatPopup from "@/components/ChatPopup.vue";
import type { User } from "@/types/api";
import { friendingApi } from "@/services/api/friendingApi";
import { authApi } from "@/services/api/authApi";
import { chatApi } from "@/services/api/chatApi";
import { useAuthStore } from "@/stores/auth";
import type { GetChatsResponse } from "@/types/chat";
import type {
  GetFriendsResponse,
  GetFriendRequestsResponse,
} from "@/types/friending";

type DiscoverableUser = User & {
  bio?: string;
  mutualFriends?: number;
  isFriend?: boolean;
};

const profiles = ref<DiscoverableUser[]>([]);
const loading = ref(false);
const fetchError = ref<string | null>(null);
const searchTerm = ref("");
const requestState = reactive<Record<string, "idle" | "pending" | "sent">>({});
const authStore = useAuthStore();

// Track IDs to filter out (existing friends and sent requests)
const friendIds = ref<string[]>([]);
const sentRequestReceiverIds = ref<string[]>([]);
// Track existing chats keyed by other user's ID
const existingChatIds = reactive<Record<string, string>>({});

// Chat popup state
const chatPopupOpen = ref(false);
const chatOtherUser = ref<{ id: string; username: string } | null>(null);
const chatId = ref<string | null>(null);

const filteredProfiles = computed(() => {
  const needle = searchTerm.value.trim().toLowerCase();
  const currentUserId = authStore.userId;
  const friendIdSet = new Set(friendIds.value);
  const sentRequestIdSet = new Set(sentRequestReceiverIds.value);

  return profiles.value
    // Never show the current user
    .filter((profile) => profile._id !== currentUserId)
    // Omit users that are already friends
    .filter((profile) => !friendIdSet.has(profile._id))
    // Omit users the current user has already sent a friend request to
    .filter((profile) => !sentRequestIdSet.has(profile._id))
    .filter((profile) =>
      needle ? profile.username.toLowerCase().includes(needle) : true
    );
});

const fetchProfiles = async () => {
  loading.value = true;
  fetchError.value = null;
  try {
    const currentUserId = authStore.userId;

    // Fetch all users plus this user's friends and sent friend requests
    const [allUsersResponse, friendsResponse, sentRequestsResponse] =
      await Promise.all([
        authApi.getAllUsers(),
        currentUserId
          ? friendingApi.getFriends({ user: currentUserId })
          : Promise.resolve({ data: [] as GetFriendsResponse[] }),
        currentUserId
          ? friendingApi.getSentRequests({ user: currentUserId })
          : Promise.resolve({ data: [] as GetFriendRequestsResponse[] }),
      ]);

    const userIds = allUsersResponse.data;

    // Capture friend IDs
    const friendResponses = (friendsResponse.data || []) as GetFriendsResponse[];
    friendIds.value = friendResponses.map((f) => f.friend);

    // Capture IDs of users we've already sent friend requests to
    const sentRequestResponses = (sentRequestsResponse.data ||
      []) as GetFriendRequestsResponse[];

    if (currentUserId) {
      const sentReceiverPromises = sentRequestResponses.map(
        async (requestResponse: GetFriendRequestsResponse) => {
          try {
            const { data: requestInfo } = await friendingApi.getRequestInfo({
              friendRequest: requestResponse.friendRequest,
            });

            const { requester, receiver } =
              requestInfo[0] || ({ requester: "", receiver: "" } as {
                requester: string;
                receiver: string;
              });

            if (!requester || !receiver) return null;

            // If current user is requester, we care about the receiver (other user)
            if (requester === currentUserId) return receiver;
            // If current user somehow appears as receiver, exclude the requester instead
            if (receiver === currentUserId) return requester;

            return null;
          } catch {
            return null;
          }
        }
      );

      const sentReceivers = (await Promise.all(sentReceiverPromises)).filter(
        (id): id is string => !!id
      );
      sentRequestReceiverIds.value = sentReceivers;
    } else {
      sentRequestReceiverIds.value = [];
    }

    // Fetch username for each user ID
    const userPromises = userIds.map(async (userResponse: any) => {
      try {
        const { data: usernameResponse } = await authApi.getUsername({
          user: userResponse.user,
        });
        return {
          _id: userResponse.user,
          username: usernameResponse[0]?.username || "Unknown",
        } as User;
      } catch (error) {
        // If username fetch fails, still include the user with ID
        return {
          _id: userResponse.user,
          username: "Unknown",
        } as User;
      }
    });

    const users = await Promise.all(userPromises);
    profiles.value = users;

    // For each profile, check if there is an existing chat with the current user
    if (currentUserId) {
      const chatChecks = users.map(async (user) => {
        if (user._id === currentUserId) return;
        try {
          const { data } = await chatApi.getChats({
            userA: currentUserId,
            userB: user._id,
          });

          if (Array.isArray(data)) {
            const chats = (data as (GetChatsResponse | { error: string })[]).filter(
              (item): item is GetChatsResponse => !("error" in item)
            );
            if (chats.length > 0 && chats[0]) {
              // Store the first chat ID for this user
              existingChatIds[user._id] = chats[0].chat;
            }
          }
        } catch {
          // Ignore chat lookup failures; button will remain \"Start Chat\"
        }
      });

      await Promise.all(chatChecks);
    }
  } catch (error) {
    fetchError.value =
      error instanceof Error ? error.message : "Unable to load profiles";
  } finally {
    loading.value = false;
  }
};

const sendFriendRequest = async (userId: string) => {
  if (!authStore.userId) {
    fetchError.value = "You need to log in before sending requests.";
    return;
  }

  requestState[userId] = "pending";
  try {
    await friendingApi.requestFriend({
      requester: authStore.userId,
      receiver: userId,
    });
    requestState[userId] = "sent";
  } catch (error) {
    requestState[userId] = "idle";
    fetchError.value =
      error instanceof Error ? error.message : "Unable to send request";
  }
};

const startChat = async (userId: string) => {
  if (!authStore.userId) {
    fetchError.value = "You need to log in before starting a chat.";
    return;
  }

  try {
    // Find the user profile to get their username
    const userProfile = profiles.value.find(p => p._id === userId);
    if (!userProfile) {
      fetchError.value = "User not found";
      return;
    }

    // If we already know about an existing chat, just open it
    const existingChatId = existingChatIds[userId];
    if (existingChatId) {
      chatOtherUser.value = {
        id: userId,
        username: userProfile.username,
      };
      chatId.value = existingChatId;
      chatPopupOpen.value = true;
      fetchError.value = null;
      return;
    }

    // Otherwise, start or get the chat
    const startResponse = await chatApi.startChat({
      requester: authStore.userId,
      receiver: userId,
    });
    
    if (startResponse.data && "error" in startResponse.data) {
      fetchError.value = startResponse.data.error;
      return;
    }

    // Get the chat ID - try from startChat response first, then getChats
    let chatIdValue: string | null = null;
    
    // Check if startChat returned a chat ID
    if (startResponse.data && "chat" in startResponse.data) {
      chatIdValue = startResponse.data.chat;
    } else {
      // Fallback: get the chat ID between the two users
      try {
        const chatResponse = await chatApi.getChats({
          userA: authStore.userId,
          userB: userId,
        });
        
        if (Array.isArray(chatResponse.data)) {
          const chats = chatResponse.data.filter(
            (item): item is GetChatsResponse => !("error" in item)
          );
          chatIdValue = chats.length > 0 && chats[0] ? chats[0].chat : null;
        }
      } catch (err) {
        console.error("Failed to get chat ID:", err);
        // Still open popup even if we can't get chat ID
      }
    }

    // Open the chat popup
    chatOtherUser.value = {
      id: userId,
      username: userProfile.username,
    };
    chatId.value = chatIdValue;
    // Remember this chat for future \"Open Chat\" actions
    if (chatIdValue) {
      existingChatIds[userId] = chatIdValue;
    }
    chatPopupOpen.value = true;
    fetchError.value = null;
  } catch (error) {
    fetchError.value =
      error instanceof Error ? error.message : "Unable to start chat";
  }
};

const closeChatPopup = () => {
  chatPopupOpen.value = false;
  chatOtherUser.value = null;
  chatId.value = null;
};

onMounted(fetchProfiles);
</script>

<template>
  <section class="friending">
    <header class="friending__header">
      <div>
        <p class="friending__eyebrow">Discover network</p>
        <h1>Connect with other fitness enthusiasts</h1>
        <p class="friending__subtitle">
          Browse profiles and send friend requests to grow your network.
        </p>
      </div>
      <div class="friending__search">
        <input
          v-model="searchTerm"
          type="search"
          placeholder="Search by username"
        />
      </div>
    </header>

    <div v-if="fetchError" class="friending__error">
      {{ fetchError }}
    </div>

    <div v-if="loading" class="friending__loading">Loading profiles…</div>

    <div
      v-else
      class="friending__list"
      v-show="filteredProfiles.length > 0"
    >
      <ProfilePage
        v-for="profile in filteredProfiles"
        :key="profile._id"
        :user="profile"
        :current-user-id="authStore.userId"
        :request-state="requestState[profile._id]"
        :has-existing-chat="!!existingChatIds[profile._id]"
        @request-friend="sendFriendRequest"
        @start-chat="startChat"
      />
    </div>

    <div v-if="!loading && filteredProfiles.length === 0" class="friending__empty">
      <p>No matching profiles right now. Try searching with a different name.</p>
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
.friending {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.friending__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
}

.friending__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  color: #6366f1;
  margin: 0 0 0.25rem;
}

.friending__subtitle {
  margin: 0.35rem 0 0;
  color: #4a5568;
}

.friending__search input {
  min-width: 240px;
  padding: 0.65rem 1rem;
  border-radius: 999px;
  border: 1px solid #cbd5f5;
  background: #fff;
}

.friending__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.friending__error {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: #fee2e2;
  color: #b91c1c;
}

.friending__loading,
.friending__empty {
  text-align: center;
  color: #4a5568;
  padding: 2rem;
  border: 1px dashed #d6d8e7;
  border-radius: 16px;
}
</style>