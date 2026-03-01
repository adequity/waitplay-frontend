import type { RoomData, RoomFurniture, FurnitureType, FurnitureSpec } from './RoomConfig'
import { FURNITURE_SPECS, ISO_CONFIG, DEFAULT_ROOM } from './RoomConfig'
import { gridToIso, getDepthValue, hexToNumber } from './IsometricUtils'

const SPRITE_BASE = '/assets/miniroom/custom/'

export class MiniRoomScene extends Phaser.Scene {
  private roomData: RoomData = DEFAULT_ROOM

  constructor() {
    super({ key: 'MiniRoomScene' })
  }

  init(data?: { roomData?: RoomData }) {
    if (data?.roomData) {
      this.roomData = data.roomData
    }
  }

  preload() {
    // Layer 0: Unified room background (walls + floor + default furniture)
    const roomTheme = this.roomData.wallTheme || 'default'
    const roomKey = `room_${roomTheme}`
    if (!this.textures.exists(roomKey)) {
      this.load.image(roomKey, SPRITE_BASE + `room_${roomTheme}.png`)
    }

    // Layer 1: Additional furniture sprites (user-placed items)
    for (const item of this.roomData.furniture) {
      const spec = FURNITURE_SPECS[item.type as FurnitureType]
      if (!spec) continue
      const key = spec.sprite
      if (!this.textures.exists(key)) {
        const fileMap: Record<string, string> = {
          custom_sofa: 'sofa.png',
          custom_table: 'table.png',
          custom_lamp: 'lamp.png',
          custom_plant: 'plant.png',
          custom_bookshelf: 'bookshelf.png',
          custom_rug: 'rug.png',
        }
        if (fileMap[key]) {
          this.load.image(key, SPRITE_BASE + fileMap[key])
        }
      }
    }
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height

    // --- Layer 0: Room background image ---
    const roomKey = `room_${this.roomData.wallTheme || 'default'}`
    if (this.textures.exists(roomKey)) {
      const roomBg = this.add.image(W / 2, H / 2, roomKey)
      // Scale to contain within screen while maintaining aspect ratio
      const tex = this.textures.get(roomKey).getSourceImage()
      const scaleX = W / tex.width
      const scaleY = H / tex.height
      const scale = Math.min(scaleX, scaleY) // contain mode
      roomBg.setScale(scale)
      roomBg.setDepth(-100)

      // Store image bounds for character placement
      const imgW = tex.width * scale
      const imgH = tex.height * scale
      const imgTop = (H - imgH) / 2
      const imgLeft = (W - imgW) / 2

      // --- Layer 1 & 2: Additional furniture + character ---
      // Place character relative to the room image, not the screen
      // Character stands on the rug area (~78% down from top of image)
      const charX = W / 2
      const charY = imgTop + imgH * 0.78
      this.drawFurnitureAndCharacter(W, H, { charX, charY, imgScale: scale })
    } else {
      // Fallback: solid gradient background
      this.drawFallbackBackground(W, H)
      this.drawFurnitureAndCharacter(W, H)
    }

    // --- Camera zoom & pan ---
    this.setupCameraControls(W, H)

    // --- Events ---
    window.dispatchEvent(new CustomEvent('miniroom-ready'))

    const updateHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.roomData) {
        this.roomData = detail.roomData
        this.scene.restart({ roomData: this.roomData })
      }
    }
    window.addEventListener('miniroom-update', updateHandler)
    this.events.on('shutdown', () => {
      window.removeEventListener('miniroom-update', updateHandler)
    })
  }

  private setupCameraControls(W: number, H: number) {
    const cam = this.cameras.main
    const MIN_ZOOM = 1
    const MAX_ZOOM = 3
    let isDragging = false
    let lastPointerX = 0
    let lastPointerY = 0
    let pinchDistance = 0

    // Mouse wheel zoom (desktop)
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gx: number[], _gy: number, _gz: number, _gw: number, dy: number) => {
      const newZoom = Phaser.Math.Clamp(cam.zoom - dy * 0.001, MIN_ZOOM, MAX_ZOOM)
      cam.setZoom(newZoom)
      if (newZoom <= MIN_ZOOM) {
        cam.centerOn(W / 2, H / 2)
      } else {
        this.clampCamera(W, H)
      }
    })

    // Drag to pan
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.input.pointer1.isDown && this.input.pointer2.isDown) return // pinch
      isDragging = true
      lastPointerX = pointer.x
      lastPointerY = pointer.y
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      // Pinch zoom (mobile: two fingers)
      if (this.input.pointer1.isDown && this.input.pointer2.isDown) {
        isDragging = false
        const p1 = this.input.pointer1
        const p2 = this.input.pointer2
        const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y)
        if (pinchDistance > 0) {
          const zoomDelta = (dist - pinchDistance) * 0.005
          const newZoom = Phaser.Math.Clamp(cam.zoom + zoomDelta, MIN_ZOOM, MAX_ZOOM)
          cam.setZoom(newZoom)
          if (newZoom <= MIN_ZOOM) {
            cam.centerOn(W / 2, H / 2)
          } else {
            this.clampCamera(W, H)
          }
        }
        pinchDistance = dist
        return
      }

      // Single finger drag (pan) — only when zoomed in
      if (isDragging && cam.zoom > MIN_ZOOM) {
        const dx = (lastPointerX - pointer.x) / cam.zoom
        const dy = (lastPointerY - pointer.y) / cam.zoom
        cam.scrollX += dx
        cam.scrollY += dy
        this.clampCamera(W, H)
        lastPointerX = pointer.x
        lastPointerY = pointer.y
      }
    })

    this.input.on('pointerup', () => {
      isDragging = false
      pinchDistance = 0
    })

    // Double-tap to reset zoom
    let lastTapTime = 0
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const now = Date.now()
      if (now - lastTapTime < 300) {
        // Double-tap: toggle between 1x and 2x
        if (cam.zoom > MIN_ZOOM + 0.1) {
          cam.setZoom(MIN_ZOOM)
          cam.centerOn(W / 2, H / 2)
        } else {
          cam.setZoom(2)
          // Zoom toward tap position
          cam.centerOn(
            cam.scrollX + pointer.x / cam.zoom,
            cam.scrollY + pointer.y / cam.zoom,
          )
          this.clampCamera(W, H)
        }
      }
      lastTapTime = now
    })
  }

  private clampCamera(W: number, H: number) {
    const cam = this.cameras.main
    const halfViewW = W / (2 * cam.zoom)
    const halfViewH = H / (2 * cam.zoom)
    cam.scrollX = Phaser.Math.Clamp(cam.scrollX, W / 2 - halfViewW, W / 2 + halfViewW - W / cam.zoom)
    cam.scrollY = Phaser.Math.Clamp(cam.scrollY, H / 2 - halfViewH, H / 2 + halfViewH - H / cam.zoom)
  }

  private drawFallbackBackground(W: number, H: number) {
    const bg = this.add.graphics()
    const topColor = 0xF0EDE8
    const bottomColor = 0xE0D8D0
    for (let y = 0; y < H; y += 4) {
      const t = y / H
      const r = ((topColor >> 16) & 0xff) * (1 - t) + ((bottomColor >> 16) & 0xff) * t
      const g = ((topColor >> 8) & 0xff) * (1 - t) + ((bottomColor >> 8) & 0xff) * t
      const b = (topColor & 0xff) * (1 - t) + (bottomColor & 0xff) * t
      bg.fillStyle((Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b), 1)
      bg.fillRect(0, y, W, 4)
    }
    bg.setDepth(-100)
  }

  private drawFurnitureAndCharacter(
    screenW: number,
    screenH: number,
    placement?: { charX: number; charY: number; imgScale: number },
  ) {
    // Character position: use placement from room image, or fallback to center
    const charX = placement?.charX ?? screenW / 2
    const charY = placement?.charY ?? screenH * 0.75
    const charScale = placement?.imgScale ? Math.max(placement.imgScale * 2, 1) : 1

    if (this.roomData.furniture.length === 0) {
      this.drawCharacter(charX, charY, charScale)
      return
    }

    // When we have user-added furniture (Phase 2), render them here
    // For now just draw the character
    this.drawCharacter(charX, charY, charScale)
  }

  private drawCharacter(cx: number, floorY: number, s: number = 1) {
    const char = this.roomData.character
    const color = hexToNumber(char.color)
    const depth = 100

    const g = this.add.graphics()

    // Shadow
    g.fillStyle(0x000000, 0.15)
    g.fillEllipse(cx, floorY + 2 * s, 30 * s, 15 * s)

    if (char.shape === 'circle') {
      // Head
      g.fillStyle(color, 1)
      g.fillCircle(cx, floorY - 28 * s, 14 * s)
      // Body
      g.fillStyle(color, 0.85)
      g.fillRoundedRect(cx - 10 * s, floorY - 16 * s, 20 * s, 16 * s, 5 * s)
    } else {
      g.fillStyle(color, 1)
      g.fillRoundedRect(cx - 12 * s, floorY - 40 * s, 24 * s, 38 * s, 8 * s)
    }

    // Eyes
    g.fillStyle(0xFFFFFF, 1)
    g.fillCircle(cx - 5 * s, floorY - 32 * s, 3 * s)
    g.fillCircle(cx + 5 * s, floorY - 32 * s, 3 * s)
    g.fillStyle(0x333333, 1)
    g.fillCircle(cx - 4 * s, floorY - 31 * s, 2 * s)
    g.fillCircle(cx + 6 * s, floorY - 31 * s, 2 * s)

    g.setDepth(depth)
  }
}
