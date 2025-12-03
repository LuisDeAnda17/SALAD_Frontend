<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const currentUser = computed(() => authStore.user?.username)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
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
            <router-link to="/friending">Friending</router-link>
            <router-link to="/challenges">Challenges</router-link>
            <router-link to="/create">Create Challenge</router-link>
            <div class="user-menu">
              <span class="username">{{ currentUser }}</span>
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
  </div>
</template>

<style>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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
  z-index: 1000;

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
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    position: fixed;
    margin-top: 4rem;
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
</style>
