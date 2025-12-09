<template>
  <div class="text-block" :class="`text-block--${data.style}`">
    <div class="text-content" v-html="formattedContent"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TextBlockData } from '@/types/blocks'

interface Props {
  data: TextBlockData
}

const props = defineProps<Props>()

// 줄바꿈을 <br> 태그로 변환
const formattedContent = computed(() => {
  return props.data.content.replace(/\n/g, '<br>')
})
</script>

<style scoped>
.text-block {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.text-content {
  font-size: 16px;
  line-height: 1.6;
  color: #1f2937;
  word-break: keep-all;
  white-space: pre-wrap;
}

/* Normal 스타일 */
.text-block--normal .text-content {
  font-size: 16px;
  color: #1f2937;
}

/* Callout 스타일 - 강조 박스 */
.text-block--callout {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border-left: 4px solid #6366f1;
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
}

.text-block--callout .text-content {
  font-size: 16px;
  color: #1e40af;
  font-weight: 500;
}

/* Quote 스타일 - 인용구 */
.text-block--quote {
  border-left: 4px solid #d1d5db;
  padding-left: 1.5rem;
  margin: 1.5rem 0;
}

.text-block--quote .text-content {
  font-size: 18px;
  color: #4b5563;
  font-style: italic;
  line-height: 1.75;
}

.text-block--quote .text-content::before {
  content: '"';
  font-size: 48px;
  color: #d1d5db;
  font-family: Georgia, serif;
  line-height: 0;
  position: relative;
  top: 20px;
  left: -10px;
}
</style>
