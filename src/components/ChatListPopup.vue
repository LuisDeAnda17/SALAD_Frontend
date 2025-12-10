<script setup lang="ts">
import { ref, onMounted } from "vue";
import { chatApi } from "@/services/api/chatApi";
import { authApi } from "@/services/api/authApi";
import type { GetUsersChatsResponse, GetDMsResponse } from "@/types/chat";

const props = defineProps<{
  currentUserId: string;
}>();

const emit = defineEmits<{
  (event: "close"): void;
  (event: "open-chat", chatId: string, otherUserId: string, otherUsername: string): void;
}>();

type ChatInfo = {
  chatId: string;
  otherUserId: string;
  otherUsername: string;
  lastMessage?: string;
  lastMessageTime?: Date;
};

const chats = ref<ChatInfo[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const deletingChatId = ref<string | null>(null);

const fetchChats = async () => {
  loading.value = true;
  error.value = null;
  chats.value = [];

  try {
    const response = await chatApi.getUsersChats({ user: props.currentUserId });

    if (Array.isArray(response.data)) {
      const validChats = response.data.filter(
        (item): item is GetUsersChatsResponse => !("error" in item)
      );

      // For each chat, get the other user and last message
      const chatPromises = validChats.map(async (chatResponse) => {
        const chatId = chatResponse.chat;

        try {
          // Get DMs to find the other user and last message
          const dmsResponse = await chatApi.getDMs({ chat: chatId });

          if (Array.isArray(dmsResponse.data)) {
            const dms = dmsResponse.data.filter(
              (item): item is GetDMsResponse => !("error" in item)
            );

            if (dms.length > 0) {
              // Find the other user (not the current user)
              const lastDm = dms[dms.length - 1];
              if (!lastDm) return null;
              const otherUserId =
                lastDm.dm.sender === props.currentUserId
                  ? lastDm.dm.receiver
                  : lastDm.dm.sender;

              // Get the other user's username
              let otherUsername = "Unknown";
              try {
                const { data: usernameResponse } = await authApi._getUsername({
                  user: otherUserId,
                });
                otherUsername = usernameResponse[0]?.username || "Unknown";
              } catch {
                // Keep default "Unknown"
              }

              // Get last message info
              const sortedDms = dms.sort(
                (a, b) =>
                  new Date(a.dm.time).getTime() - new Date(b.dm.time).getTime()
              );
              const lastMessage = sortedDms[sortedDms.length - 1];
              if (!lastMessage) return null;
              const lastMessageText = lastMessage.dm.message;
              const lastMessageTime = new Date(lastMessage.dm.time);

              return {
                chatId,
                otherUserId,
                otherUsername,
                lastMessage: lastMessageText,
                lastMessageTime,
              } as ChatInfo;
            } else {
              // No messages yet, but we still need to find the other user
              // Try to get chat info from getChats (this might not work if chat is empty)
              // For now, return null and we'll handle it
              return null;
            }
          }
        } catch (err) {
          console.error(`Failed to get info for chat ${chatId}:`, err);
          return null;
        }
        return null;
      });

      const chatInfos = (await Promise.all(chatPromises)).filter(
        (info): info is ChatInfo => info !== null
      );

      // Sort by last message time (most recent first)
      chats.value = chatInfos.sort((a, b) => {
        if (!a.lastMessageTime && !b.lastMessageTime) return 0;
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
      });
    } else if (response.data && typeof response.data === 'object' && 'error' in response.data) {
      error.value = (response.data as { error: string }).error;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load chats";
  } finally {
    loading.value = false;
  }
};

const deleteChat = async (chatId: string, event: Event) => {
  event.stopPropagation(); // Prevent opening the chat when clicking delete

  if (!confirm("Are you sure you want to delete this chat?")) {
    return;
  }

  deletingChatId.value = chatId;
  try {
    const response = await chatApi.deleteChat({
      chat: chatId,
      user: props.currentUserId,
    });

    if (response.data && "error" in response.data) {
      error.value = response.data.error;
    } else {
      // Remove from list and refresh
      chats.value = chats.value.filter((c) => c.chatId !== chatId);
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to delete chat";
  } finally {
    deletingChatId.value = null;
  }
};

const openChat = (chat: ChatInfo) => {
  emit("open-chat", chat.chatId, chat.otherUserId, chat.otherUsername);
};

const closePopup = () => {
  emit("close");
};

onMounted(() => {
  fetchChats();
});
</script>

<template>
  <div class="chat-list-overlay" @click.self="closePopup">
    <div class="chat-list-popup">
      <div class="chat-list-popup__header">
        <h3>Your Chats</h3>
        <button
          class="chat-list-popup__close"
          @click="closePopup"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div v-if="error" class="chat-list-popup__error">
        {{ error }}
      </div>

      <div class="chat-list-popup__content">
        <div v-if="loading" class="chat-list-popup__loading">
          Loading chats...
        </div>

        <div v-else-if="chats.length === 0" class="chat-list-popup__empty">
          <p>No chats yet. Start a conversation!</p>
        </div>

        <div v-else class="chat-list-popup__list">
          <div
            v-for="chat in chats"
            :key="chat.chatId"
            class="chat-list-item"
            @click="openChat(chat)"
          >
            <div class="chat-list-item__avatar">
              <span>{{ chat.otherUsername.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="chat-list-item__content">
              <div class="chat-list-item__header">
                <h4>{{ chat.otherUsername }}</h4>
                <span
                  v-if="chat.lastMessageTime"
                  class="chat-list-item__time"
                >
                  {{
                    new Date(chat.lastMessageTime).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                </span>
              </div>
              <p v-if="chat.lastMessage" class="chat-list-item__preview">
                {{ chat.lastMessage }}
              </p>
              <p v-else class="chat-list-item__preview chat-list-item__preview--empty">
                No messages yet
              </p>
            </div>
            <button
              class="chat-list-item__delete"
              @click="deleteChat(chat.chatId, $event)"
              :disabled="deletingChatId === chat.chatId"
              aria-label="Delete chat"
            >
              {{ deletingChatId === chat.chatId ? "Deleting..." : "Delete" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-list-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.chat-list-popup {
  background: #1c1c1c;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5),
    0 10px 10px -5px rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
}

.chat-list-popup__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #333;
}

.chat-list-popup__header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #eee;
}

.chat-list-popup__close {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: #aaa;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.chat-list-popup__close:hover {
  background-color: #2a2a2a;
  color: #eee;
}

.chat-list-popup__error {
  padding: 0.75rem 1.5rem;
  background: rgba(239, 68, 68, 0.2);
  color: #ff6b6b;
  font-size: 0.875rem;
  border: 1px solid rgba(239, 68, 68, 0.5);
}

.chat-list-popup__content {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
  max-height: 500px;
  background: #1c1c1c;
  padding: 0.5rem;
}

.chat-list-popup__loading,
.chat-list-popup__empty {
  text-align: center;
  color: #aaa;
  padding: 3rem 2rem;
  font-size: 0.875rem;
}

.chat-list-popup__list {
  display: flex;
  flex-direction: column;
}

.chat-list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
  background: #2a2a2a;
  margin-bottom: 8px;
  border-radius: 6px;
  border: 1px solid #333;
}

.chat-list-item:hover {
  background-color: #333;
}

.chat-list-item__avatar {
  height: 3rem;
  width: 3rem;
  border-radius: 50%;
  background: #1c1c1c;
  color: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
  flex-shrink: 0;
  border: 1px solid #444;
}

.chat-list-item__content {
  flex: 1;
  min-width: 0;
}

.chat-list-item__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.chat-list-item__header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #eee;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-list-item__time {
  font-size: 0.75rem;
  color: #888;
  flex-shrink: 0;
}

.chat-list-item__preview {
  margin: 0;
  font-size: 0.875rem;
  color: #aaa;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-list-item__preview--empty {
  font-style: italic;
  color: #888;
}

.chat-list-item__delete {
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
  flex-shrink: 0;
}

.chat-list-item__delete:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.85);
}

.chat-list-item__delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

