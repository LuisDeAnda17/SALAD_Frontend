<script setup lang="ts">
import { ref, computed, onMounted, defineProps } from 'vue'
const props = defineProps<{ challenge: any }>()
</script>
<template>
  <router-link :to="`/challenge/${challenge.id}`">
    <div class="card">
      <h3>{{ challenge.title }}</h3>
    </div>
  </router-link>
</template>
