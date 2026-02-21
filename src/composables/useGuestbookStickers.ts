import { ref, computed, onUnmounted } from 'vue'

export interface EditingSticker {
  type: string
  content: string
  x: number
  y: number
  scale: number
  rotation: number
}

/**
 * 캔버스 위 스티커 드래그/편집 로직
 * @param containerRef - 스티커 위치 계산 기준이 되는 컨테이너 (canvasRef.parentElement 대신 직접 전달)
 */
export function useGuestbookStickers(containerRef: () => HTMLElement | null | undefined) {
  const editingStickers = ref<EditingSticker[]>([])
  const selectedEditingStickerIndex = ref<number | null>(null)

  // 드래그 상태
  let isDragging = false
  let dragStartOffset = { x: 0, y: 0 }

  // 핀치 제스처 상태
  let isGesturing = false
  let initialPinchDistance = 0
  let initialPinchAngle = 0
  let initialStickerScale = 1
  let initialStickerRotation = 0

  const selectedEditingSticker = computed(() => {
    if (selectedEditingStickerIndex.value === null) return null
    return editingStickers.value[selectedEditingStickerIndex.value] ?? null
  })

  const addSticker = (type: string, content: string) => {
    const newSticker: EditingSticker = {
      type,
      content,
      x: 50,
      y: 50,
      scale: type === 'emoji' ? 1.0 : 0.6,
      rotation: 0
    }
    editingStickers.value.push(newSticker)
    selectedEditingStickerIndex.value = editingStickers.value.length - 1
  }

  const deleteSticker = (index: number) => {
    editingStickers.value.splice(index, 1)
    selectedEditingStickerIndex.value = null
  }

  const deselectAll = () => {
    selectedEditingStickerIndex.value = null
  }

  const clearAll = () => {
    editingStickers.value = []
    selectedEditingStickerIndex.value = null
  }

  // --- 핀치 제스처 유틸 ---

  const getDistance = (t1: Touch, t2: Touch): number => {
    const dx = t2.clientX - t1.clientX
    const dy = t2.clientY - t1.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getAngle = (t1: Touch, t2: Touch): number => {
    return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI)
  }

  // --- 마우스 드래그 ---

  const selectSticker = (index: number, e: MouseEvent) => {
    if (selectedEditingStickerIndex.value === index) {
      selectedEditingStickerIndex.value = null
      return
    }
    selectedEditingStickerIndex.value = index
    isDragging = true

    const container = containerRef()
    if (!container) return

    const rect = container.getBoundingClientRect()
    const sticker = editingStickers.value[index]
    if (!sticker) return

    const stickerX = (sticker.x / 100) * rect.width
    const stickerY = (sticker.y / 100) * rect.height

    dragStartOffset = {
      x: e.clientX - rect.left - stickerX,
      y: e.clientY - rect.top - stickerY
    }

    document.addEventListener('mousemove', onDragMouse)
    document.addEventListener('mouseup', onDragEnd)
  }

  const onDragMouse = (e: MouseEvent) => {
    if (!isDragging || selectedEditingStickerIndex.value === null) return

    const container = containerRef()
    if (!container) return

    const sticker = editingStickers.value[selectedEditingStickerIndex.value]
    if (!sticker) return

    const rect = container.getBoundingClientRect()
    const x = ((e.clientX - rect.left - dragStartOffset.x) / rect.width) * 100
    const y = ((e.clientY - rect.top - dragStartOffset.y) / rect.height) * 100

    sticker.x = Math.max(5, Math.min(95, x))
    sticker.y = Math.max(5, Math.min(95, y))
  }

  // --- 터치 드래그 + 핀치 제스처 ---

  const selectStickerTouch = (index: number, e: TouchEvent) => {
    if (selectedEditingStickerIndex.value === index && e.touches.length < 2) {
      selectedEditingStickerIndex.value = null
      return
    }
    selectedEditingStickerIndex.value = index

    const container = containerRef()
    if (!container) return

    const sticker = editingStickers.value[index]
    if (!sticker) return

    const rect = container.getBoundingClientRect()

    if (e.touches.length >= 2) {
      // 핀치 제스처 시작
      isGesturing = true
      isDragging = false
      const t1 = e.touches[0]!
      const t2 = e.touches[1]!
      initialPinchDistance = getDistance(t1, t2)
      initialPinchAngle = getAngle(t1, t2)
      initialStickerScale = sticker.scale
      initialStickerRotation = sticker.rotation
    } else {
      // 한 손가락 드래그
      isDragging = true
      isGesturing = false
      const touch = e.touches[0]
      if (!touch) return

      const stickerX = (sticker.x / 100) * rect.width
      const stickerY = (sticker.y / 100) * rect.height

      dragStartOffset = {
        x: touch.clientX - rect.left - stickerX,
        y: touch.clientY - rect.top - stickerY
      }
    }

    document.addEventListener('touchmove', onTouchMoveUnified, { passive: false })
    document.addEventListener('touchend', onTouchEndUnified)
  }

  const onTouchMoveUnified = (e: TouchEvent) => {
    if (selectedEditingStickerIndex.value === null) return
    e.preventDefault()

    const sticker = editingStickers.value[selectedEditingStickerIndex.value]
    if (!sticker) return

    if (e.touches.length >= 2 && (isGesturing || !isDragging)) {
      // 핀치/회전 제스처 처리
      if (!isGesturing) {
        // 드래그 중 두 번째 손가락이 추가된 경우 → 제스처 전환
        isGesturing = true
        isDragging = false
        const t1 = e.touches[0]!
        const t2 = e.touches[1]!
        initialPinchDistance = getDistance(t1, t2)
        initialPinchAngle = getAngle(t1, t2)
        initialStickerScale = sticker.scale
        initialStickerRotation = sticker.rotation
      }

      const t1 = e.touches[0]!
      const t2 = e.touches[1]!
      const currentDistance = getDistance(t1, t2)
      const currentAngle = getAngle(t1, t2)

      // 스케일 업데이트
      const scaleRatio = currentDistance / initialPinchDistance
      sticker.scale = Math.max(0.3, Math.min(3.0, initialStickerScale * scaleRatio))

      // 회전 업데이트
      const angleDelta = currentAngle - initialPinchAngle
      sticker.rotation = initialStickerRotation + angleDelta
    } else if (e.touches.length === 1 && isDragging) {
      // 한 손가락 드래그
      const touch = e.touches[0]
      if (!touch) return

      const container = containerRef()
      if (!container) return

      const rect = container.getBoundingClientRect()
      const x = ((touch.clientX - rect.left - dragStartOffset.x) / rect.width) * 100
      const y = ((touch.clientY - rect.top - dragStartOffset.y) / rect.height) * 100

      sticker.x = Math.max(5, Math.min(95, x))
      sticker.y = Math.max(5, Math.min(95, y))
    }
  }

  const onTouchEndUnified = (e: TouchEvent) => {
    if (e.touches.length === 0) {
      // 모든 손가락 뗌
      isDragging = false
      isGesturing = false
      document.removeEventListener('touchmove', onTouchMoveUnified)
      document.removeEventListener('touchend', onTouchEndUnified)
    } else if (e.touches.length === 1 && isGesturing) {
      // 핀치 중 한 손가락 남음 → 드래그 모드 전환
      isGesturing = false
      isDragging = true

      const sticker = selectedEditingStickerIndex.value !== null
        ? editingStickers.value[selectedEditingStickerIndex.value]
        : null
      if (!sticker) return

      const container = containerRef()
      if (!container) return

      const touch = e.touches[0]!
      const rect = container.getBoundingClientRect()
      const stickerX = (sticker.x / 100) * rect.width
      const stickerY = (sticker.y / 100) * rect.height

      dragStartOffset = {
        x: touch.clientX - rect.left - stickerX,
        y: touch.clientY - rect.top - stickerY
      }
    }
  }

  const onDragEnd = () => {
    isDragging = false
    isGesturing = false
    document.removeEventListener('mousemove', onDragMouse)
    document.removeEventListener('mouseup', onDragEnd)
    document.removeEventListener('touchmove', onTouchMoveUnified)
    document.removeEventListener('touchend', onTouchEndUnified)
  }

  // 컴포넌트 언마운트 시 이벤트 정리
  onUnmounted(() => {
    onDragEnd()
  })

  return {
    editingStickers,
    selectedEditingStickerIndex,
    selectedEditingSticker,
    addSticker,
    deleteSticker,
    deselectAll,
    clearAll,
    selectSticker,
    selectStickerTouch,
  }
}
