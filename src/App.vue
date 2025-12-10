<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from './stores/auth'
import { computed, ref } from 'vue'
import ChatListPopup from './components/ChatListPopup.vue'
import ChatPopup from './components/ChatPopup.vue'

const authStore = useAuthStore()
const router = useRouter()
const currentUser = computed(() => authStore.user?.username)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Chat list popup state
const chatListPopupOpen = ref(false)

// Chat popup state
const chatPopupOpen = ref(false)
const chatOtherUser = ref<{ id: string; username: string } | null>(null)
const chatId = ref<string | null>(null)

const openChatList = () => {
  chatListPopupOpen.value = true
}

const closeChatList = () => {
  chatListPopupOpen.value = false
}

const openChatFromList = async (
  chatIdValue: string,
  otherUserId: string,
  otherUsername: string,
) => {
  // Close chat list
  chatListPopupOpen.value = false

  // Set chat popup state
  chatOtherUser.value = { id: otherUserId, username: otherUsername }
  chatId.value = chatIdValue
  chatPopupOpen.value = true
}

const closeChatPopup = () => {
  chatPopupOpen.value = false
  chatOtherUser.value = null
  chatId.value = null
}
</script>

<template>
  <div id="app">
    <header>
      <nav>
        <div class="nav-brand">
          <h2>GymTogether</h2>
        </div>

        <div class="nav-links">
          <router-link to="/">Home</router-link>

          <template v-if="authStore.isAuthenticated">
            <router-link to="/group">Group</router-link>
            <router-link to="/network">Network</router-link>
            <router-link to="/leaderboard">Leaderboard</router-link>
            <router-link to="/friends">Friends</router-link>
            <div class="user-menu">
              <router-link to="/profile" class="username">{{ currentUser }}</router-link>
              
              <button @click="handleLogout" class="logout-btn">Logout</button>
            </div>
          </template>

          <template v-else>
            <router-link to="/login">Sign In</router-link>
          </template>
        </div>
      </nav>
    </header>

    <main class="content">
      <RouterView />
    </main>

    <!-- Floating Chat Button -->
    <button
      v-if="authStore.isAuthenticated"
      @click="openChatList"
      class="floating-chat-btn"
      aria-label="Open chats"
    >
      💬
    </button>

    <ChatListPopup
      v-if="chatListPopupOpen && authStore.userId"
      :current-user-id="authStore.userId"
      @close="closeChatList"
      @open-chat="openChatFromList"
    />

    <ChatPopup
      v-if="chatPopupOpen && chatOtherUser && authStore.userId"
      :other-user-id="chatOtherUser.id"
      :other-username="chatOtherUser.username"
      :current-user-id="authStore.userId"
      :chat-id="chatId"
      @close="closeChatPopup"
    />
  </div>
</template>

<style>
#app {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: black;
}

/* HEADER / NAVBAR */
header {
  width: 100%;
}

nav {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2000;

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 1rem 2rem;

  background-color: black;
  opacity: 0.8;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

/* MAIN CONTENT AREA */
.content {
  width: 100%;
  flex: 1;
  padding-top: 24px;
  background-color: black;
  margin-top: 4rem;
  position: relative;
  z-index: 1;
}

/* ---- NAVBAR STYLING ---- */

.nav-brand h2 {
  color: white;
  margin: 0;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.username {
  color: white;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.floating-chat-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow:
    0 4px 12px rgba(37, 99, 235, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.floating-chat-btn:hover {
  background: #1d4ed8;
  transform: scale(1.1);
  box-shadow:
    0 6px 16px rgba(37, 99, 235, 0.5),
    0 4px 8px rgba(0, 0, 0, 0.3);
}

.floating-chat-btn:active {
  transform: scale(0.95);
}
</style>
