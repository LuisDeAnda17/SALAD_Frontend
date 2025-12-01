<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
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

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const fetchMessages = async () => {
  if (!props.chatId) return;
  
  loading.value = true;
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
            const { data: usernameResponse } = await authApi.getUsername({ 
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
      messages.value = messagesWithUsernames.sort(
        (a, b) => a.time.getTime() - b.time.getTime()
      );
      
      scrollToBottom();
    } else if (response.data && "error" in response.data) {
      error.value = response.data.error;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load messages";
  } finally {
    loading.value = false;
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !props.chatId || sending.value) return;
  
  sending.value = true;
  error.value = null;
  try {
    const response = await chatApi.sendChat({
      sender: props.currentUserId,
      receiver: props.otherUserId,
      message: newMessage.value.trim(),
    });
    
    if (response.data && "error" in response.data) {
      error.value = response.data.error;
    } else {
      newMessage.value = "";
      // Refresh messages to show the new one
      await fetchMessages();
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
  emit("close");
};

onMounted(() => {
  if (props.chatId) {
    fetchMessages();
  }
});

watch(() => props.chatId, (newChatId) => {
  if (newChatId) {
    fetchMessages();
  } else {
    messages.value = [];
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
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.chat-popup__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.chat-popup__header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.chat-popup__close {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: #6b7280;
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
  background-color: #f3f4f6;
  color: #111827;
}

.chat-popup__error {
  padding: 0.75rem 1.5rem;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 0.875rem;
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
}

.chat-popup__loading,
.chat-popup__empty {
  text-align: center;
  color: #6b7280;
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
  background: #f3f4f6;
  color: #111827;
  border-bottom-left-radius: 4px;
}

.chat-popup__message-time {
  font-size: 0.75rem;
  color: #6b7280;
  padding: 0 0.5rem;
}

.chat-popup__input {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.chat-popup__input input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9375rem;
  outline: none;
  transition: border-color 0.2s;
}

.chat-popup__input input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.chat-popup__input input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.chat-popup__send {
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.chat-popup__send:hover:not(:disabled) {
  background: #1d4ed8;
}

.chat-popup__send:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>

