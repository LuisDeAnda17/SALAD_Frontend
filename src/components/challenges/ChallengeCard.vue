<script setup lang="ts">
import { ref, computed, onMounted, defineProps } from 'vue'
const props = defineProps<{ challenge: any }>()
</script>
<template>
  <router-link :to="`/challenge/${challenge}`">
    <div class="card">
      <h3>{{ challenge }}</h3>
    </div>
  </router-link>
</template>
