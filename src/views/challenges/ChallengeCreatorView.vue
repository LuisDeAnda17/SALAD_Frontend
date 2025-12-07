<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useChallengeParticipationStore } from '@/stores/challengeParticipation'
import { useRoute } from 'vue-router'
import UserList from '@/components/users/UserList.vue'

const role = 'creator'
const route = useRoute()
const challenge = route.params.challenge as string

// Stores
const authStore = useAuthStore()
const { userId, sessionId } = storeToRefs(authStore)

const { _getUser } = authStore

const challengeDefinitionStore = useChallengeDefinitionStore()
const { deleteChallenge, openChallenge, closeChallenge, _isOpen } = challengeDefinitionStore

const challengeParticipationStore = useChallengeParticipationStore()
const {
  createInvitation,
  removeInvitation,
  removeParticipation,
  _getChallengeInvitations,
  _getChallengeParticipations,
  _getInvitation,
  _getParticipation,
} = challengeParticipationStore

// Form State
const selectedInviteeUsername = ref('')
const selectedInviteeNonexistent = ref(false)

const selectedInviteeToRemoveUsername = ref('')
const selectedInviteeToRemoveNonexistent = ref(false)
const selectedInviteeToRemoveNotInvited = ref(false)

const selectedParticipantToRemoveUsername = ref('')
const selectedParticipantToRemoveNonexistent = ref(false)
const selectedParticipantToRemoveNotParticipating = ref(false)

const invitations = ref<Array<{ invitation: string; user: string }>>([])
const participations = ref<Array<{ participation: string; user: string }>>([])

const challengeOpen = ref(false)

// NEW — inline delete confirmation
const showDeleteConfirm = ref(false)

// ---------- LOGIC ----------

function clearWarnings() {
  selectedInviteeNonexistent.value = false
  selectedInviteeToRemoveNonexistent.value = false
  selectedInviteeToRemoveNotInvited.value = false
  selectedParticipantToRemoveNonexistent.value = false
  selectedParticipantToRemoveNotParticipating.value = false
}

async function submitInvitation() {
  clearWarnings()
  const user = await _getUser(selectedInviteeUsername.value)
  if (Array.isArray(user) && user[0] && sessionId.value) {
    await createInvitation(sessionId.value, user[0].user, challenge)
  } else {
    selectedInviteeNonexistent.value = true
  }
  await fetchChallengeData()
}

async function submitRemoveInvitation() {
  clearWarnings()
  const user = await _getUser(selectedInviteeToRemoveUsername.value)
  if (Array.isArray(user) && user[0] && sessionId.value) {
    const userId = user[0].user
    const inv = await _getInvitation(userId, challenge)
    if (Array.isArray(inv) && inv[0]) {
      await removeInvitation(sessionId.value, inv[0].invitation)
    } else {
      selectedInviteeToRemoveNotInvited.value = true
    }
  } else {
    selectedInviteeToRemoveNonexistent.value = true
  }
  await fetchChallengeData()
}

async function submitRemoveParticipation() {
  clearWarnings()
  const user = await _getUser(selectedParticipantToRemoveUsername.value)
  if (Array.isArray(user) && user[0] && sessionId.value) {
    const part = await _getParticipation(user[0].user, challenge)
    if (Array.isArray(part) && part[0]) {
      await removeParticipation(sessionId.value, part[0].participation)
    } else {
      selectedParticipantToRemoveNotParticipating.value = true
    }
  } else {
    selectedParticipantToRemoveNonexistent.value = true
  }
  await fetchChallengeData()
}

// The actual delete call
async function submitDeleteChallenge() {
  if (sessionId.value) {
    await deleteChallenge(sessionId.value, challenge)
  }
}

async function submitOpenChallenge() {
  if (sessionId.value) {
    await openChallenge(sessionId.value, challenge)
    await fetchChallengeData()
  }
}

async function submitCloseChallenge() {
  if (sessionId.value) {
    await closeChallenge(sessionId.value, challenge)
    await fetchChallengeData()
  }
}

async function fetchChallengeData() {
  const inv = await _getChallengeInvitations(challenge)
  if (Array.isArray(inv)) invitations.value = inv

  const parts = await _getChallengeParticipations(challenge)
  if (Array.isArray(parts)) participations.value = parts

  const openState = await _isOpen(challenge)
  if (Array.isArray(openState) && openState[0]) {
    challengeOpen.value = openState[0].isOpen
  }
}

onMounted(fetchChallengeData)
</script>

<template>
  <div v-if="userId" class="challenge-creator-controls">
    <!-- PEOPLE MANAGEMENT -->
    <div class="people-controls">
      <!-- INVITATIONS -->
      <div class="invitation-controls">
        <div class="invitees">
          <h3>Invitees</h3>
          <UserList :users="invitations" />
        </div>

        <div class="invitation-forms">
          <!-- create -->
          <div class="form-card">
            <h4>Invite a User</h4>
            <input type="text" placeholder="Enter username" v-model="selectedInviteeUsername" />
            <button @click="submitInvitation">Invite</button>
          </div>

          <p v-if="selectedInviteeNonexistent" class="warning-text">That user does not exist.</p>

          <!-- remove -->
          <div class="form-card">
            <h4>Remove Invitation</h4>
            <input
              type="text"
              placeholder="Enter username"
              v-model="selectedInviteeToRemoveUsername"
            />
            <button @click="submitRemoveInvitation">Remove Invite</button>
          </div>

          <p v-if="selectedInviteeToRemoveNonexistent" class="warning-text">
            That user does not exist.
          </p>
          <p v-if="selectedInviteeToRemoveNotInvited" class="warning-text">
            That user is not invited.
          </p>
        </div>
      </div>

      <!-- PARTICIPATION -->
      <div class="participation-controls">
        <div class="participants">
          <h3>Participants</h3>
          <UserList :users="participations" />
        </div>

        <div class="form-card">
          <h4>Remove Participant</h4>
          <input
            type="text"
            placeholder="Enter username"
            v-model="selectedParticipantToRemoveUsername"
          />
          <button @click="submitRemoveParticipation">Remove Participant</button>
        </div>

        <p v-if="selectedParticipantToRemoveNonexistent" class="warning-text">
          That user does not exist.
        </p>
        <p v-if="selectedParticipantToRemoveNotParticipating" class="warning-text">
          That user is not participating.
        </p>
      </div>
    </div>

    <!-- OPEN/CLOSE CHALLENGE -->
    <div class="open-controls">
      <button v-if="!challengeOpen" class="open-challenge-btn" @click="submitOpenChallenge">
        Open Challenge
      </button>
      <button v-if="challengeOpen" class="open-challenge-btn" @click="submitCloseChallenge">
        Close Challenge
      </button>
    </div>

    <!-- DELETE SECTION -->
    <div class="delete-challenge-section">
      <!-- initial delete button -->
      <button
        v-if="!showDeleteConfirm"
        class="delete-challenge-btn"
        @click="showDeleteConfirm = true"
      >
        Delete Challenge
      </button>

      <!-- confirmation box -->
      <div v-if="showDeleteConfirm" class="delete-confirm-card">
        <p class="warning-title">Are you sure?</p>
        <p class="warning-desc">
          This action cannot be undone. All data for this challenge will be permanently removed.
        </p>

        <div class="confirm-actions">
          <router-link :to="`/`">
            <button class="confirm-delete-btn" @click="submitDeleteChallenge">
              Yes, Delete Challenge
            </button>
          </router-link>

          <button class="cancel-delete-btn" @click="showDeleteConfirm = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.challenge-creator-controls {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  color: white;
}

.people-controls {
  display: flex;
  justify-content: center;
  gap: 2em;
}

.invitation-controls,
.participation-controls {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.invitation-forms,
.participation-controls > .form-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-card {
  background-color: #111;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.form-card input {
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #444;
  background-color: #222;
  color: white;
}

.form-card input::placeholder {
  color: #aaa;
}

.form-card button {
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  background-color: #333;
  color: white;
  cursor: pointer;
  transition: 0.2s ease;
}

.form-card button:hover {
  background-color: #555;
}

.warning-text {
  color: rgba(239, 68, 68, 0.6);
  font-size: 0.8rem;
}

/* Open/Close */
.open-controls {
  display: flex;
  justify-content: center;
}

.open-challenge-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: rgba(62, 99, 62, 0.2);
  border: 1px solid rgba(62, 99, 62, 0.6);
  color: white;
  cursor: pointer;
  transition: 0.2s;
}

.open-challenge-btn:hover {
  background: rgba(62, 99, 62, 0.3);
}

/* DELETE BUTTON */
.delete-challenge-section {
  display: flex;
  justify-content: center;
}

.delete-challenge-btn {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: 0.2s;
}
.delete-challenge-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* CONFIRM DELETE PANEL */
.delete-confirm-card {
  background: #1a1a1a;
  border: 1px solid rgba(239, 68, 68, 0.4);
  padding: 1.5rem;
  border-radius: 12px;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 1rem;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.2);
}

.warning-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: rgba(239, 68, 68, 0.9);
}

.warning-desc {
  color: #ccc;
  font-size: 0.95rem;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* confirm delete */
.confirm-delete-btn {
  padding: 0.6rem 1rem;
  background: rgba(239, 68, 68, 0.25);
  border: 1px solid rgba(239, 68, 68, 0.6);
  border-radius: 6px;
  color: white;
  cursor: pointer;
}
.confirm-delete-btn:hover {
  background: rgba(239, 68, 68, 0.4);
}

/* cancel delete */
.cancel-delete-btn {
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #666;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}
.cancel-delete-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
