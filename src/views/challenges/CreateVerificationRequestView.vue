<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useChallengeVerificationStore } from '@/stores/challengeVerification'
import { useFriendingStore } from '@/stores/friending'
import { useRoute } from 'vue-router'
import UserList from '@/components/users/UserList.vue'

// --- Route ---
const route = useRoute()
const challenge = route.params.challenge as string
const part = route.query.part as string // passed from progress grid

// --- Stores ---
const authStore = useAuthStore()
const { userId, sessionId } = storeToRefs(authStore)
const { _getUser, _getUsername } = authStore

const verificationStore = useChallengeVerificationStore()
const { createVerificationRequest } = verificationStore

const friendingStore = useFriendingStore()
const { _getFriends } = friendingStore

// --- State ---
const alreadyExists = ref(false)
const selectedApproverUsername = ref('')
const selectedEvidence = ref('')

const friendIds = ref<string[]>([])
const friendUsers = ref<Array<{ user: string }>>([])
const friendUsernameLookup = ref<Record<string, string>>({})

const submitted = ref(false)
const failed = ref(false)

// Select an approver when clicking a friend in the list
function onFriendSelected(uuid: string) {
  const username = friendUsernameLookup.value[uuid]
  if (username) {
    selectedApproverUsername.value = username
  }
}

// Submit request
async function submitVerificationRequest() {
  if (!sessionId.value || !userId.value) {
    failed.value = true
    return
  }

  const userResult = await _getUser(selectedApproverUsername.value)
  if (!Array.isArray(userResult) || !userResult[0]) {
    failed.value = true
    return
  }

  const approver = userResult[0].user

  await createVerificationRequest(
    sessionId.value,
    challenge,
    part,
    userId.value,
    approver,
    selectedEvidence.value,
  )
  submitted.value = true
}

// Load friend data
async function fetchData() {
  if (!userId.value) return

  const friends = await _getFriends(userId.value)
  if (!Array.isArray(friends)) return

  for (const f of friends) {
    friendIds.value.push(f.friend)
    friendUsers.value.push({ user: f.friend })

    const usernameResult = await _getUsername(f.friend)
    if (Array.isArray(usernameResult) && usernameResult[0]) {
      friendUsernameLookup.value[f.friend] = usernameResult[0].username
    }
  }
}

onMounted(fetchData)
</script>

<template>
  <div v-if="userId && !alreadyExists" class="verification-request-wrapper">
    <h3 v-if="submitted">Verification request created!</h3>
    <h3 v-if="failed">Sorry, creating verification request failed!</h3>
    <h2 class="page-title">Create Verification Request</h2>

    <div class="request-form-container">
      <!-- Approver selection -->
      <div class="form-card">
        <h4>Select Approver</h4>
        <input
          type="text"
          placeholder="Select a friend as approver"
          v-model="selectedApproverUsername"
          readonly
        />
        <p class="hint-text">Tap a friend below to choose them.</p>
      </div>

      <!-- Scrollable friend list -->
      <div class="form-card">
        <h4>Your Friends</h4>
        <UserList :users="friendUsers" @select="onFriendSelected" />
      </div>

      <!-- Evidence entry -->
      <div class="form-card">
        <h4>Evidence</h4>
        <input
          type="text"
          v-model="selectedEvidence"
          placeholder="Enter evidence text (upload later)"
        />
      </div>

      <!-- Submit -->
      <button
        class="submit-request-btn"
        :disabled="!selectedApproverUsername || !selectedEvidence"
        @click="submitVerificationRequest"
      >
        Submit Request
      </button>
    </div>
  </div>
</template>

<style scoped>
.verification-request-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  color: white;
  align-items: center;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-top: 1rem;
}

.request-form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

/* form-card copied from Create Challenge page */
.form-card {
  background-color: #111;
  padding: 0.5rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.form-card h4 {
  margin: 0;
}

.form-card input {
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #444;
  background-color: #222;
  color: white;
}

.form-card input::placeholder {
  color: #aaa;
}

.hint-text {
  font-size: 0.8rem;
  color: #ccc;
  opacity: 0.7;
}

.submit-request-btn {
  padding: 0.7rem 1.2rem;
  background: rgba(62, 99, 62, 0.25);
  color: white;
  border: 1px solid rgba(62, 99, 62, 0.6);
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}

.submit-request-btn:hover {
  background: rgba(62, 99, 62, 0.35);
}

.submit-request-btn:disabled {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
}
</style>
