<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { chatApi } from "@/services/api/chatApi";
import { authApi } from "@/services/api/authApi";
import type { GetDMsResponse } from "@/types/chat";

const props = defineProps<{
  otherUserId: string;
  otherUsername: string;
  currentUserId: string;
  chatId: string | null;
}>();

const emit = defineEmits<{
  (event: "close"): void;
}>();

const messages = ref<Array<{
  id: string;
  message: string;
  sender: string;
  receiver: string;
  time: Date;
  senderUsername?: string;
}>>([]);
const newMessage = ref("");
const loading = ref(false);
const sending = ref(false);
const error = ref<string | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);
const pollingInterval = ref<number | null>(null);
const lastMessageId = ref<string | null>(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const fetchMessages = async (isPolling = false) => {
  if (!props.chatId) return;
  
  // Only show loading indicator on initial load, not during polling
  if (!isPolling) {
    loading.value = true;
  }
  error.value = null;
  try {
    const response = await chatApi.getDMs({ chat: props.chatId });
    
    if (Array.isArray(response.data)) {
      const dms = response.data.filter((item): item is GetDMsResponse => 
        !("error" in item)
      );
      
      // Fetch usernames for all messages
      const messagesWithUsernames = await Promise.all(
        dms.map(async (dm) => {
          let senderUsername = "Unknown";
          try {
            const { data: usernameResponse } = await authApi._getUsername({ 
              user: dm.dm.sender 
            });
            senderUsername = usernameResponse[0]?.username || "Unknown";
          } catch {
            // Keep default "Unknown"
          }
          
          return {
            id: dm.dm.id,
            message: dm.dm.message,
            sender: dm.dm.sender,
            receiver: dm.dm.receiver,
            time: new Date(dm.dm.time),
            senderUsername,
          };
        })
      );
      
      // Sort by time
      const sortedMessages = messagesWithUsernames.sort(
        (a, b) => a.time.getTime() - b.time.getTime()
      );
      
      // If polling, only update if there are new messages
      if (isPolling && lastMessageId.value) {
        const newMessages = sortedMessages.filter(
          msg => !messages.value.some(existing => existing.id === msg.id)
        );
        
        if (newMessages.length > 0) {
          // Append new messages
          messages.value = [...messages.value, ...newMessages].sort(
            (a, b) => a.time.getTime() - b.time.getTime()
          );
          scrollToBottom();
        }
      } else {
        // Initial load or no previous messages - replace all
        messages.value = sortedMessages;
        scrollToBottom();
      }
      
      // Update last message ID for polling comparison
      if (sortedMessages.length > 0) {
        const lastMsg = sortedMessages[sortedMessages.length - 1];
        if (lastMsg) {
          lastMessageId.value = lastMsg.id;
        }
      }
    } else if (response.data && typeof response.data === 'object' && 'error' in response.data) {
      error.value = (response.data as { error: string }).error;
    }
  } catch (err) {
    if (!isPolling) {
      error.value = err instanceof Error ? err.message : "Failed to load messages";
    }
  } finally {
    if (!isPolling) {
      loading.value = false;
    }
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !props.chatId || sending.value) return;
  
  const messageText = newMessage.value.trim();
  sending.value = true;
  error.value = null;
  try {
    const response = await chatApi.sendChat({
      sender: props.currentUserId,
      receiver: props.otherUserId,
      message: messageText,
    });
    
    if (response.data && "error" in response.data) {
      error.value = response.data.error;
    } else {
      newMessage.value = "";
      // Refresh messages to show the new one
      await fetchMessages();
      
      // Notify other components (including other users' views) that a message was sent
      // This allows real-time updates across tabs/devices
      window.dispatchEvent(
        new CustomEvent("message-sent", {
          detail: {
            chatId: props.chatId,
            sender: props.currentUserId,
            receiver: props.otherUserId,
          },
        })
      );
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to send message";
  } finally {
    sending.value = false;
  }
};

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

const closePopup = () => {
  stopPolling();
  emit("close");
};

const startPolling = () => {
  // Clear any existing interval
  stopPolling();
  
  // Poll for new messages every 2 seconds
  pollingInterval.value = window.setInterval(() => {
    if (props.chatId) {
      fetchMessages(true); // true indicates this is a polling request
    }
  }, 2000);
};

const stopPolling = () => {
  if (pollingInterval.value !== null) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
};

// Handle message-sent events to refresh immediately when a message is sent
const handleMessageSent = (event: CustomEvent<{ chatId: string; sender: string; receiver: string }>) => {
  const { chatId, sender, receiver } = event.detail;
  
  // Refresh if this message is for the current chat
  // Check if current user is either sender or receiver
  if (
    props.chatId === chatId &&
    (sender === props.currentUserId || receiver === props.currentUserId)
  ) {
    // Small delay to ensure backend has processed the message
    setTimeout(() => {
      fetchMessages(true);
    }, 500);
  }
};

onMounted(() => {
  if (props.chatId) {
    fetchMessages();
    startPolling();
  }
  
  // Listen for message-sent events
  window.addEventListener("message-sent", handleMessageSent as EventListener);
});

onUnmounted(() => {
  stopPolling();
  window.removeEventListener("message-sent", handleMessageSent as EventListener);
});

watch(() => props.chatId, (newChatId, oldChatId) => {
  if (newChatId) {
    lastMessageId.value = null; // Reset last message ID
    fetchMessages();
    startPolling();
  } else {
    stopPolling();
    messages.value = [];
    lastMessageId.value = null;
  }
});
</script>

<template>
  <div class="chat-popup-overlay" @click.self="closePopup">
    <div class="chat-popup">
      <div class="chat-popup__header">
        <h3>Chat with {{ otherUsername }}</h3>
        <button class="chat-popup__close" @click="closePopup" aria-label="Close">
          ×
        </button>
      </div>
      
      <div v-if="error" class="chat-popup__error">
        {{ error }}
      </div>
      
      <div ref="messagesContainer" class="chat-popup__messages">
        <div v-if="loading && messages.length === 0" class="chat-popup__loading">
          Loading messages...
        </div>
        
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="[
            'chat-popup__message',
            msg.sender === currentUserId ? 'chat-popup__message--sent' : 'chat-popup__message--received'
          ]"
        >
          <div class="chat-popup__message-content">
            {{ msg.message }}
          </div>
          <div class="chat-popup__message-time">
            {{ new Date(msg.time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) }}
            ·
            {{ new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
          </div>
        </div>
        
        <div v-if="!loading && messages.length === 0" class="chat-popup__empty">
          No messages yet. Start the conversation!
        </div>
      </div>
      
      <div class="chat-popup__input">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type a message..."
          :disabled="sending || !chatId"
          @keypress="handleKeyPress"
        />
        <button
          class="chat-popup__send"
          :disabled="!newMessage.trim() || sending || !chatId"
          @click="sendMessage"
        >
          {{ sending ? "Sending..." : "Send" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-popup-overlay {
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

.chat-popup {
  background: #1c1c1c;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
}

.chat-popup__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #333;
}

.chat-popup__header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #eee;
}

.chat-popup__close {
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

.chat-popup__close:hover {
  background-color: #2a2a2a;
  color: #eee;
}

.chat-popup__error {
  padding: 0.75rem 1.5rem;
  background: rgba(239, 68, 68, 0.2);
  color: #ff6b6b;
  font-size: 0.875rem;
  border: 1px solid rgba(239, 68, 68, 0.5);
}

.chat-popup__messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 200px;
  max-height: 400px;
  background: #1c1c1c;
}

.chat-popup__loading,
.chat-popup__empty {
  text-align: center;
  color: #aaa;
  padding: 2rem;
  font-size: 0.875rem;
}

.chat-popup__message {
  display: flex;
  flex-direction: column;
  max-width: 75%;
  gap: 0.25rem;
}

.chat-popup__message--sent {
  align-self: flex-end;
  align-items: flex-end;
}

.chat-popup__message--received {
  align-self: flex-start;
  align-items: flex-start;
}

.chat-popup__message-content {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  word-wrap: break-word;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.chat-popup__message--sent .chat-popup__message-content {
  background: #2563eb;
  color: white;
  border-bottom-right-radius: 4px;
}

.chat-popup__message--received .chat-popup__message-content {
  background: #2a2a2a;
  color: #eee;
  border-bottom-left-radius: 4px;
  border: 1px solid #333;
}

.chat-popup__message-time {
  font-size: 0.75rem;
  color: #888;
  padding: 0 0.5rem;
}

.chat-popup__input {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #333;
  background: #1c1c1c;
}

.chat-popup__input input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #444;
  border-radius: 6px;
  font-size: 0.9375rem;
  outline: none;
  transition: border-color 0.2s;
  background: #2a2a2a;
  color: #eee;
}

.chat-popup__input input::placeholder {
  color: #888;
}

.chat-popup__input input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.chat-popup__input input:disabled {
  background: #1c1c1c;
  cursor: not-allowed;
  opacity: 0.6;
}

.chat-popup__send {
  padding: 0.75rem 1.5rem;
  background: rgba(37, 99, 235, 0.75);
  color: white;
  border: 1px solid rgba(37, 99, 235, 0.9);
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.chat-popup__send:hover:not(:disabled) {
  background: rgba(37, 99, 235, 0.85);
}

.chat-popup__send:disabled {
  background: rgba(156, 163, 175, 0.5);
  border-color: rgba(156, 163, 175, 0.7);
  cursor: not-allowed;
  opacity: 0.6;
}
</style>

