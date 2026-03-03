<template>
  <div class="hex-village" ref="containerRef">
    <div class="hex-grid" :style="gridStyle">
      <!-- Center: User's own room -->
      <div
        class="hex-cell hex-center"
        :style="centerStyle"
        @click="$emit('centerTap')"
      >
        <div class="hex-shape hex-shape-center">
          <svg viewBox="0 0 100 87" class="hex-icon-svg">
            <text x="50" y="50" text-anchor="middle" dominant-baseline="middle" font-size="32">🏠</text>
          </svg>
        </div>
        <span class="hex-label">나의 방</span>
      </div>

      <!-- Collected store rooms -->
      <div
        v-for="room in rooms"
        :key="room.id"
        class="hex-cell hex-store"
        :style="getCellStyle(room.gridQ, room.gridR)"
        @click="$emit('roomTap', room)"
      >
        <div class="hex-shape" :style="{ backgroundColor: room.roomColor }">
          <img
            v-if="room.roomImageUrl"
            :src="room.roomImageUrl"
            :alt="room.roomName"
            class="hex-room-image"
            loading="lazy"
          />
        </div>
        <span class="hex-label">{{ room.storeName }}</span>
      </div>

      <!-- Empty ghost cells (ring hints) -->
      <div
        v-for="(pos, i) in ghostPositions"
        :key="`ghost-${i}`"
        class="hex-cell hex-ghost"
        :style="getCellStyle(pos.q, pos.r)"
      >
        <div class="hex-shape hex-shape-ghost">
          <svg viewBox="0 0 100 87" class="hex-icon-svg hex-icon-ghost">
            <text x="50" y="50" text-anchor="middle" dominant-baseline="middle" font-size="20">?</text>
          </svg>
        </div>
      </div>
    </div>

    <!-- Info text -->
    <p class="village-info" v-if="rooms.length > 0">
      수집한 매장 룸: {{ rooms.length }}개
    </p>
    <p class="village-info village-empty-hint" v-else>
      매장에서 게임을 클리어하면 방이 추가됩니다
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { hexToPixel, spiralPositions, neededRings, hexBoundingBox, type HexPosition } from '@/utils/hexGridUtils'
import type { UserStoreRoom } from '@/services/storeRoomService'

const props = defineProps<{
  rooms: UserStoreRoom[]
  nickname: string
  isMyProfile: boolean
}>()

defineEmits<{
  centerTap: []
  roomTap: [room: UserStoreRoom]
}>()

const containerRef = ref<HTMLElement | null>(null)
const containerWidth = ref(360)

const HEX_CLIP = 'polygon(75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%, 25% 0%)'

const hexSize = computed(() => {
  const rings = neededRings(props.rooms.length)
  // Fit grid in container with padding
  const maxDiameter = containerWidth.value / (rings * 2 + 2)
  return Math.max(Math.min(maxDiameter, 56), 32)
})

const occupiedSet = computed(() => {
  const set = new Set<string>()
  set.add('0,0') // center
  for (const room of props.rooms) {
    set.add(`${room.gridQ},${room.gridR}`)
  }
  return set
})

const ghostPositions = computed(() => {
  const rings = neededRings(props.rooms.length)
  const displayRing = Math.min(rings + 1, 3) // show up to 1 extra ring, max 3
  const allPositions = spiralPositions(displayRing)
  return allPositions.filter(
    pos => !occupiedSet.value.has(`${pos.q},${pos.r}`)
  )
})

const allDisplayedPositions = computed(() => {
  const positions: HexPosition[] = props.rooms.map(r => ({ q: r.gridQ, r: r.gridR }))
  positions.push(...ghostPositions.value)
  return positions
})

const bounds = computed(() => {
  return hexBoundingBox(allDisplayedPositions.value, hexSize.value)
})

const gridStyle = computed(() => {
  const w = bounds.value.width + hexSize.value
  const h = bounds.value.height + hexSize.value + 24 // extra for labels
  return {
    width: w + 'px',
    height: h + 'px',
    position: 'relative' as const,
    margin: '0 auto',
  }
})

const centerX = computed(() => -bounds.value.minX + hexSize.value / 2)
const centerY = computed(() => -bounds.value.minY + hexSize.value * Math.sqrt(3) / 2)

const centerStyle = computed(() => {
  const size = hexSize.value
  const dim = size * 2
  const h = size * Math.sqrt(3)
  return {
    width: dim + 'px',
    height: h + 'px',
    left: (centerX.value - size) + 'px',
    top: (centerY.value - h / 2) + 'px',
  }
})

function getCellStyle(q: number, r: number) {
  const pixel = hexToPixel(q, r, hexSize.value)
  const size = hexSize.value
  const dim = size * 2
  const h = size * Math.sqrt(3)
  return {
    width: dim + 'px',
    height: h + 'px',
    left: (centerX.value + pixel.x - size) + 'px',
    top: (centerY.value + pixel.y - h / 2) + 'px',
  }
}

function updateWidth() {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateWidth()
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.hex-village {
  width: 100%;
  padding: 12px 0;
  overflow-x: auto;
  overflow-y: visible;
}

.hex-grid {
  min-height: 120px;
}

.hex-cell {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.hex-cell:hover {
  transform: scale(1.08);
  z-index: 10;
}

.hex-shape {
  width: 100%;
  height: 100%;
  clip-path: v-bind(HEX_CLIP);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.hex-shape-center {
  background: linear-gradient(135deg, #667eea, #764ba2);
  box-shadow: 0 0 12px rgba(102, 126, 234, 0.4);
}

.hex-shape-ghost {
  background: transparent;
  border: 2px dashed #d1d1d6;
  /* clip-path removes border, use outline trick via box-shadow */
  background: rgba(0, 0, 0, 0.03);
}

.hex-room-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hex-icon-svg {
  width: 60%;
  height: 60%;
}

.hex-icon-ghost {
  opacity: 0.3;
}

.hex-label {
  font-size: 10px;
  color: #555;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-align: center;
  line-height: 1.2;
}

.hex-center .hex-label {
  font-weight: 600;
  color: #6366F1;
}

.village-info {
  text-align: center;
  font-size: 13px;
  color: #86868b;
  margin: 12px 0 0;
}

.village-empty-hint {
  color: #aeaeb2;
  font-size: 14px;
}
</style>
