<script setup lang="ts">
import VerificationRequestCard from './VerificationRequestCard.vue'
import { ref, computed, onMounted } from 'vue'
const props = defineProps<{ verificationRequests: Array<any>; role: string }>()
</script>
<template>
  <div class="request-list-wrapper">
    <VerificationRequestCard
      v-for="v in verificationRequests"
      :key="v.verificationRequest"
      :verificationRequest="v.verificationRequest"
      :role="role"
    />
  </div>
</template>
<style scoped>
.request-list-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  gap: 2rem;
}
</style>
