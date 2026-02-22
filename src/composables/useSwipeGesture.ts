import { ref, computed, type Ref, type ComputedRef, type CSSProperties } from 'vue'

interface SwipeGestureOptions {
  threshold?: number
  onDismiss: (direction: 'left' | 'right') => void
  onClick?: () => void
}

interface SwipeGestureReturn {
  offsetX: Ref<number>
  offsetY: Ref<number>
  isDragging: Ref<boolean>
  isAnimating: Ref<boolean>
  isPastThreshold: Ref<boolean>
  cardStyle: ComputedRef<CSSProperties>
  onPointerDown: (e: PointerEvent) => void
  onPointerMove: (e: PointerEvent) => void
  onPointerUp: (e: PointerEvent) => void
  reset: () => void
}

export function useSwipeGesture(options: SwipeGestureOptions): SwipeGestureReturn {
  const threshold = options.threshold ?? 120

  const offsetX = ref(0)
  const offsetY = ref(0)
  const isDragging = ref(false)
  const isAnimating = ref(false)

  let startX = 0
  let startY = 0
  let pointerId = -1

  const isPastThreshold = computed(() => Math.abs(offsetX.value) > threshold)

  const cardStyle = computed<CSSProperties>(() => {
    const x = offsetX.value
    const y = isDragging.value ? offsetY.value * 0.3 : 0
    const rotate = Math.min(Math.max(x * 0.05, -12), 12)
    const opacity = isDragging.value
      ? Math.max(1 - Math.abs(x) / (threshold * 3), 0.2)
      : 1

    return {
      transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
      transition: isDragging.value ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
      opacity,
      cursor: isDragging.value ? 'grabbing' : 'grab',
      touchAction: 'none',
    }
  })

  function onPointerDown(e: PointerEvent) {
    if (isAnimating.value) return
    isDragging.value = true
    startX = e.clientX
    startY = e.clientY
    pointerId = e.pointerId
    ;(e.currentTarget as HTMLElement)?.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging.value || e.pointerId !== pointerId) return
    offsetX.value = e.clientX - startX
    offsetY.value = e.clientY - startY
  }

  function onPointerUp(e: PointerEvent) {
    if (!isDragging.value || e.pointerId !== pointerId) return
    isDragging.value = false

    const movedX = Math.abs(offsetX.value)
    const movedY = Math.abs(offsetY.value)

    // Click detection: minimal movement
    if (movedX < 5 && movedY < 5) {
      reset()
      options.onClick?.()
      return
    }

    if (movedX > threshold) {
      // Dismiss: animate out
      const direction: 'left' | 'right' = offsetX.value < 0 ? 'left' : 'right'
      isAnimating.value = true
      const flyX = direction === 'left' ? -window.innerWidth * 1.5 : window.innerWidth * 1.5
      offsetX.value = flyX
      offsetY.value = 0

      setTimeout(() => {
        options.onDismiss(direction)
        // Reset after dismiss callback
        offsetX.value = 0
        offsetY.value = 0
        isAnimating.value = false
      }, 400)
    } else {
      // Spring back
      offsetX.value = 0
      offsetY.value = 0
    }
  }

  function reset() {
    offsetX.value = 0
    offsetY.value = 0
    isDragging.value = false
    isAnimating.value = false
    pointerId = -1
  }

  return {
    offsetX,
    offsetY,
    isDragging,
    isAnimating,
    isPastThreshold,
    cardStyle,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    reset,
  }
}
