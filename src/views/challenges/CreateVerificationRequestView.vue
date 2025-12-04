<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useChallengeDefinitionStore } from '@/stores/challengeDefinition'
import { useChallengeProgressStore } from '@/stores/challengeProgress'
import { useChallengeVerificationStore } from '@/stores/challengeVerification'
import { useFriendingStore } from '@/stores/friending'
import { useRoute } from 'vue-router'

const route = useRoute()
const challenge = route.params.challenge as string
const part = route.params.challenge as string
const day = route.params.day as string
const week = route.params.day as string

const challengeVerificationStore = useChallengeVerificationStore()
const authStore = useAuthStore()
const { _getUser } = authStore
const { sessionId, userId } = storeToRefs(authStore)
const challengeDefinitionStore = useChallengeDefinitionStore()
const friendingStore = useFriendingStore()
const { _getFriends } = friendingStore
const { createVerificationRequest } = challengeVerificationStore

const selectedApproverUsername = ref<string>('')
const selectedEvidence = ref<string>('')

const friends = ref<Array<{ friend: string }>>([])
async function submitVerificationRequest() {
  if (sessionId.value && userId.value) {
    const userResult = await _getUser(selectedApproverUsername.value)
    if (Array.isArray(userResult) && userResult[0]) {
      const approver = userResult[0].user
      await createVerificationRequest(
        sessionId.value,
        challenge,
        part,
        userId.value,
        approver,
        selectedEvidence.value,
      )
    }
  }
}

async function fetchData() {
  if (userId.value) {
    const friendsResult = await _getFriends(userId.value)
    if (Array.isArray(friendsResult)) {
      const friends = friendsResult
    }
  }
}

onMounted(fetchData)
</script>

<template>
  <h2>Create Verification Request</h2>
</template>

<style scoped></style>
