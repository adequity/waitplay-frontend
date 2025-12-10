<template>
  <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <g v-html="getIconPath"></g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { icons } from '@/constants/icons'

interface Props {
  name: string
}

const props = defineProps<Props>()

const getIconPath = computed(() => {
  return icons[props.name] || ''
})
</script>

<style scoped>
.icon-svg {
  width: 1em;
  height: 1em;
  display: inline-block;
  vertical-align: middle;
}
</style>
