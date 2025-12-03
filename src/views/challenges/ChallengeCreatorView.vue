<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import type {
  ExerciseInfo,
  RepAerobicInfo,
  AnaerobicInfo,
  DistanceAerobicInfo,
} from '@/types/challengeDefinition'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useChallengeParticipationStore } from '@/stores/challengeParticipation'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import UserList from '@/components/users/UserList.vue'
const role = 'creator'
const route = useRoute()
const challenge = route.params.challenge as string // the UUID
const authStore = useAuthStore()
const { _getUsername, _getUser } = authStore
const { userId, sessionId } = storeToRefs(authStore)
const challengeDefinitionStore = useChallengeDefinitionStore()
const challengeParticipationStore = useChallengeParticipationStore()
const { deleteChallenge } = challengeDefinitionStore
const {
  createInvitation,
  removeInvitation,
  removeParticipation,
  _getChallengeInvitations,
  _getChallengeParticipations,
  _getInvitation,
  _getParticipation,
} = challengeParticipationStore

const selectedInviteeUsername = ref<string>('')
const selectedInviteeNonexistent = ref<boolean>(false)
const selectedInviteeToRemoveUsername = ref<string>('')
const selectedInviteeToRemoveNonexistent = ref<boolean>(false)
const selectedInviteeToRemoveNotInvited = ref<boolean>(false)
const selectedParticipantToRemoveUsername = ref<string>('')
const selectedParticipantToRemoveNonexistent = ref<boolean>(false)
const selectedParticipantToRemoveNotParticipating = ref<boolean>(false)

async function submitInvitation() {
  clearWarnings()
  const selectedUser = await _getUser(selectedInviteeUsername.value)
  if (Array.isArray(selectedUser) && selectedUser[0] && sessionId.value) {
    const selectedUserId = selectedUser[0].user
    await createInvitation(sessionId.value, selectedUserId, challenge)
  } else {
    selectedInviteeNonexistent.value = true
  }
  await fetchChallengeData()
}

async function submitRemoveInvitation() {
  clearWarnings()
  const selectedUser = await _getUser(selectedInviteeToRemoveUsername.value)
  if (Array.isArray(selectedUser) && selectedUser[0] && sessionId.value) {
    const selectedUserId = selectedUser[0].user
    const invitationResult = await _getInvitation(selectedUserId, challenge)
    if (Array.isArray(invitationResult) && invitationResult[0]) {
      const invitation = invitationResult[0].invitation
      await removeInvitation(sessionId.value, invitation)
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
  const selectedUser = await _getUser(selectedParticipantToRemoveUsername.value)
  if (Array.isArray(selectedUser) && selectedUser[0] && sessionId.value) {
    const selectedUserId = selectedUser[0].user
    const participationResult = await _getParticipation(selectedUserId, challenge)
    if (Array.isArray(participationResult) && participationResult[0]) {
      const participation = participationResult[0].participation
      await removeParticipation(sessionId.value, participation)
    } else {
      selectedParticipantToRemoveNotParticipating.value = true
    }
  } else {
    selectedParticipantToRemoveNonexistent.value = true
  }
  await fetchChallengeData()
}

async function submitDeleteChallenge() {
  clearWarnings()
  if (sessionId.value) {
    await deleteChallenge(sessionId.value, challenge)
    await fetchChallengeData()
  }
}

const invitations = ref<Array<{ invitation: string; user: string }>>([])
const participations = ref<Array<{ participation: string; user: string }>>([])

async function fetchChallengeData() {
  const challengeInvitations = await _getChallengeInvitations(challenge)
  if (Array.isArray(challengeInvitations)) {
    invitations.value = challengeInvitations
  }
  const challengeParticipations = await _getChallengeParticipations(challenge)
  if (Array.isArray(challengeParticipations)) {
    participations.value = challengeParticipations
  }
}

function clearWarnings() {
  selectedInviteeNonexistent.value = false
  selectedInviteeToRemoveNotInvited.value = false
  selectedInviteeToRemoveNonexistent.value = false
  selectedParticipantToRemoveNonexistent.value = false
  selectedParticipantToRemoveNotParticipating.value = false
}

onMounted(fetchChallengeData)
</script>

<template>
  <div v-if="userId" class="challenge-creator-controls">
    <div class="people-controls">
      <div class="invitation-controls">
        <div class="invitees">
          <h3>Invitees</h3>
          <UserList :users="invitations"></UserList>
        </div>

        <div class="invitation-forms">
          <!-- Create Invitation Form -->
          <div class="create-invitation-form form-card">
            <h4>Invite a User</h4>
            <input type="text" placeholder="Enter username" v-model="selectedInviteeUsername" />
            <button @click="submitInvitation">Invite</button>
          </div>

          <!-- Warning: Nonexistent user -->
          <p v-if="selectedInviteeNonexistent" class="warning-text">That user does not exist.</p>

          <!-- Remove Invitation Form -->
          <div class="remove-invitation-form form-card">
            <h4>Remove an Invitation</h4>
            <input
              type="text"
              placeholder="Enter username"
              v-model="selectedInviteeToRemoveUsername"
            />
            <button @click="submitRemoveInvitation">Remove Invitation</button>
          </div>

          <!-- Warnings for Remove Invitation -->
          <p v-if="selectedInviteeToRemoveNonexistent" class="warning-text">
            That user does not exist.
          </p>
          <p v-if="selectedInviteeToRemoveNotInvited" class="warning-text">
            That user is not invited.
          </p>
        </div>
      </div>

      <div class="participation-controls">
        <div class="participants">
          <h3>Participants</h3>
          <UserList :users="participations"></UserList>
        </div>

        <!-- Remove Participation Form -->
        <div class="remove-participation-form form-card">
          <h4>Remove a Participant</h4>
          <input
            type="text"
            placeholder="Enter username"
            v-model="selectedParticipantToRemoveUsername"
          />
          <button @click="submitRemoveParticipation">Remove Participant</button>
        </div>

        <!-- Warnings for Remove Participation -->
        <p v-if="selectedParticipantToRemoveNonexistent" class="warning-text">
          That user does not exist.
        </p>
        <p v-if="selectedParticipantToRemoveNotParticipating" class="warning-text">
          That user is not participating.
        </p>
      </div>
    </div>

    <!-- Delete Challenge Button -->
    <div class="delete-challenge-section">
      <router-link :to="`/challenges`">
        <button class="delete-challenge-btn" @click="submitDeleteChallenge">
          Delete Challenge
        </button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.challenge-creator-controls {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  margin: 0;
  color: white;
  padding: 0.5rem;
}

.invitation-controls,
.participation-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}

.people-controls {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 2em;
}
.invitation-forms,
.participation-controls > .remove-participation-form {
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
  transition: background-color 0.2s ease;
}

.form-card button:hover {
  background-color: #555;
}

/* Delete Challenge Button */
.delete-challenge-section {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.delete-challenge-btn {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.delete-challenge-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.warning-text {
  color: rgba(255, 80, 80, 0.75);
  font-size: 0.8rem;
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
  padding-left: 0.25rem;
}
</style>
