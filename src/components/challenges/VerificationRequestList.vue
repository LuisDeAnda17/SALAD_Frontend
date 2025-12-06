<script setup lang="ts">
import VerificationRequestCard from './VerificationRequestCard.vue'
import { ref, computed, onMounted, defineProps } from 'vue'
const props = defineProps<{ verificationRequests: Array<any>; role: string }>()
</script>
<template>
  <div>
    <VerificationRequestCard
      v-for="v in verificationRequests"
      :key="v.verificationRequest"
      :verificationRequest="v.verificationRequest"
      :role="role"
    />
  </div>
</template>
<style scoped></style>
