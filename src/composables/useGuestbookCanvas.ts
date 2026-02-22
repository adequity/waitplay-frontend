import { ref, computed, type Ref } from 'vue'

export type DisplayMode = 'postit' | 'graffiti'

export interface CanvasOptions {
  displayMode: Ref<DisplayMode> | DisplayMode
}

export function useGuestbookCanvas(options: CanvasOptions) {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const ctx = ref<CanvasRenderingContext2D | null>(null)
  const isDrawing = ref(false)
  const hasDrawing = ref(false)

  // 배경 이미지
  const backgroundImage = ref<HTMLImageElement | null>(null)

  // 도구 설정
  const minBrushSize = 1
  const maxBrushSize = 20
  const selectedColor = ref('#000000')
  const brushSize = ref(4)

  // 지우개
  const isEraser = ref(false)
  const toggleEraser = () => { isEraser.value = !isEraser.value }

  // Undo/Redo 스택
  const MAX_UNDO_STEPS = 15
  const undoStack: ImageData[] = []
  const redoStack: ImageData[] = []
  const canUndo = computed(() => undoStack.length > 0)
  const canRedo = computed(() => redoStack.length > 0)

  const saveState = () => {
    if (!ctx.value || !canvasRef.value) return
    const imageData = ctx.value.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height)
    undoStack.push(imageData)
    if (undoStack.length > MAX_UNDO_STEPS) undoStack.shift()
    redoStack.length = 0
  }

  const undo = () => {
    if (!ctx.value || !canvasRef.value || undoStack.length === 0) return
    const current = ctx.value.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height)
    redoStack.push(current)
    const prev = undoStack.pop()!
    ctx.value.putImageData(prev, 0, 0)
    if (undoStack.length === 0) hasDrawing.value = false
  }

  const redo = () => {
    if (!ctx.value || !canvasRef.value || redoStack.length === 0) return
    const current = ctx.value.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height)
    undoStack.push(current)
    const next = redoStack.pop()!
    ctx.value.putImageData(next, 0, 0)
    hasDrawing.value = true
  }

  // 터치 좌표 추적
  let lastX = 0
  let lastY = 0

  const getDisplayMode = (): DisplayMode => {
    const mode = options.displayMode
    return typeof mode === 'string' ? mode : mode.value
  }

  /** 지우개/펜 모드에 따라 ctx 설정 */
  const applyBrushStyle = () => {
    if (!ctx.value) return
    if (isEraser.value) {
      // 모든 모드에서 destination-out 사용 (투명하게 지우기)
      ctx.value.globalCompositeOperation = 'destination-out'
      ctx.value.strokeStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.value.globalCompositeOperation = 'source-over'
      ctx.value.strokeStyle = selectedColor.value
    }
    ctx.value.lineWidth = brushSize.value
  }

  /** 배경 이미지를 캔버스에 cover 방식으로 그리기 */
  const drawBackground = () => {
    if (!ctx.value || !canvasRef.value || !backgroundImage.value) return
    const img = backgroundImage.value
    const canvas = canvasRef.value
    const imgRatio = img.width / img.height
    const canvasRatio = canvas.width / canvas.height
    let sx: number, sy: number, sw: number, sh: number
    if (imgRatio > canvasRatio) {
      sh = img.height
      sw = sh * canvasRatio
      sx = (img.width - sw) / 2
      sy = 0
    } else {
      sw = img.width
      sh = sw / canvasRatio
      sx = 0
      sy = (img.height - sh) / 2
    }
    ctx.value.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  }

  /** File → 배경 이미지로 설정 */
  const setBackgroundImage = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          backgroundImage.value = img
          if (ctx.value && canvasRef.value) {
            saveState()
            drawBackground()
            hasDrawing.value = true
          }
          resolve()
        }
        img.onerror = reject
        img.src = reader.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const clearBackgroundImage = () => {
    backgroundImage.value = null
  }

  const initCanvas = () => {
    if (!canvasRef.value) return

    const canvas = canvasRef.value
    const container = canvas.parentElement
    if (!container) return

    canvas.width = container.clientWidth
    canvas.height = container.clientHeight

    ctx.value = canvas.getContext('2d')

    if (ctx.value) {
      if (backgroundImage.value) {
        drawBackground()
      } else {
        // 항상 투명 캔버스로 초기화 (배경색은 CSS wrapper가 담당)
        ctx.value.clearRect(0, 0, canvas.width, canvas.height)
      }
      ctx.value.lineCap = 'round'
      ctx.value.lineJoin = 'round'
    }

    // 초기화 시 스택 리셋
    undoStack.length = 0
    redoStack.length = 0
  }

  const startDrawing = (e: MouseEvent) => {
    if (!ctx.value || !canvasRef.value) return

    saveState()
    isDrawing.value = true
    hasDrawing.value = true

    const rect = canvasRef.value.getBoundingClientRect()
    lastX = e.clientX - rect.left
    lastY = e.clientY - rect.top

    ctx.value.beginPath()
    ctx.value.moveTo(lastX, lastY)
  }

  const draw = (e: MouseEvent) => {
    if (!isDrawing.value || !ctx.value || !canvasRef.value) return

    const rect = canvasRef.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    applyBrushStyle()
    ctx.value.lineTo(x, y)
    ctx.value.stroke()

    lastX = x
    lastY = y
  }

  const handleTouchStart = (e: TouchEvent) => {
    if (!ctx.value || !canvasRef.value) return

    const touch = e.touches[0]
    if (!touch) return

    saveState()
    isDrawing.value = true
    hasDrawing.value = true

    const rect = canvasRef.value.getBoundingClientRect()
    lastX = touch.clientX - rect.left
    lastY = touch.clientY - rect.top

    ctx.value.beginPath()
    ctx.value.moveTo(lastX, lastY)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDrawing.value || !ctx.value || !canvasRef.value) return

    const touch = e.touches[0]
    if (!touch) return

    const rect = canvasRef.value.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    applyBrushStyle()
    ctx.value.lineTo(x, y)
    ctx.value.stroke()

    lastX = x
    lastY = y
  }

  const stopDrawing = () => {
    if (isDrawing.value && ctx.value) {
      // 스트로크 후 composite 모드 복원
      ctx.value.globalCompositeOperation = 'source-over'
    }
    isDrawing.value = false
  }

  const clearCanvas = () => {
    if (!ctx.value || !canvasRef.value) return

    backgroundImage.value = null

    // 항상 투명으로 클리어 (배경색은 CSS wrapper가 담당)
    ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

    hasDrawing.value = false
    undoStack.length = 0
    redoStack.length = 0
  }

  /** 스티커 선택 해제를 위한 콜백 (DrawingModal에서 설정) */
  let onCanvasTouchCallback: (() => void) | null = null

  const setOnCanvasTouch = (cb: () => void) => {
    onCanvasTouchCallback = cb
  }

  // 캔버스 터치 시 스티커 선택 해제를 트리거하는 래퍼
  const startDrawingWithDeselect = (e: MouseEvent) => {
    onCanvasTouchCallback?.()
    startDrawing(e)
  }

  const handleTouchStartWithDeselect = (e: TouchEvent) => {
    onCanvasTouchCallback?.()
    handleTouchStart(e)
  }

  return {
    canvasRef,
    ctx,
    isDrawing,
    hasDrawing,
    selectedColor,
    brushSize,
    minBrushSize,
    maxBrushSize,
    initCanvas,
    startDrawing: startDrawingWithDeselect,
    draw,
    handleTouchStart: handleTouchStartWithDeselect,
    handleTouchMove,
    stopDrawing,
    clearCanvas,
    setOnCanvasTouch,
    // 새 기능
    isEraser,
    toggleEraser,
    undo,
    redo,
    canUndo,
    canRedo,
    // 배경 이미지
    backgroundImage,
    setBackgroundImage,
    clearBackgroundImage,
  }
}
