<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const currentUser = computed(() => authStore.userId)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
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
</template>

<style scoped>
header {
  width: 100%;
}

nav {
  width: 100%;
  position: fixed;        /* makes navbar fixed at top */
  top: 0;
  left: 0;
  z-index: 1000;

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 1rem 2rem;

  background-color: var(--raspberry-rose);
  opacity: 0.8;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.content {
  padding-top: 90px;      /* prevents content from sitting under navbar */
}

/* ---- existing navbar styling below ---- */

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
