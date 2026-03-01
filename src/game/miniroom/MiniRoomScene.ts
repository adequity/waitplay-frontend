import type { RoomData, FurnitureType } from './RoomConfig'
import { FURNITURE_SPECS, DEFAULT_ROOM } from './RoomConfig'
import { hexToNumber } from './IsometricUtils'

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
    const roomTheme = this.roomData.wallTheme || 'default'
    const roomKey = `room_${roomTheme}`
    if (!this.textures.exists(roomKey)) {
      this.load.image(roomKey, SPRITE_BASE + `room_${roomTheme}.png`)
    }

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
    this.renderRoom()
    this.setupCameraControls()
    this.setupResizeHandler()
    this.setupEvents()
  }

  private renderRoom() {
    const W = this.scale.width
    const H = this.scale.height

    const roomKey = `room_${this.roomData.wallTheme || 'default'}`
    if (this.textures.exists(roomKey)) {
      const roomBg = this.add.image(W / 2, H / 2, roomKey)
      const tex = this.textures.get(roomKey).getSourceImage()
      const scaleX = W / tex.width
      const scaleY = H / tex.height
      const scale = Math.min(scaleX, scaleY)
      roomBg.setScale(scale)
      roomBg.setDepth(-100)

      // Character placement relative to room image
      const imgH = tex.height * scale
      const imgTop = (H - imgH) / 2
      const charX = W / 2
      const charY = imgTop + imgH * 0.78

      // Scale character proportional to rendered image height
      // Base: character designed at ~40px tall for a ~600px image height
      const charScale = Math.max((imgH / 600) * 1.2, 0.5)
      this.drawCharacter(charX, charY, charScale)
    } else {
      this.drawFallbackBackground(W, H)
      this.drawCharacter(W / 2, H * 0.75, 1)
    }
  }

  private setupCameraControls() {
    const cam = this.cameras.main
    const MIN_ZOOM = 1
    const MAX_ZOOM = 3
    const TAP_MOVE_THRESHOLD = 10

    let isDown = false
    let hasMoved = false
    let startX = 0
    let startY = 0
    let lastPointerX = 0
    let lastPointerY = 0
    let pinchDistance = 0
    let wasPinching = false
    let lastTapTime = 0

    // Mouse wheel zoom (desktop)
    this.input.on('wheel', (
      _pointer: Phaser.Input.Pointer,
      _over: Phaser.GameObjects.GameObject[],
      _deltaX: number,
      deltaY: number,
    ) => {
      const newZoom = Phaser.Math.Clamp(cam.zoom - deltaY * 0.002, MIN_ZOOM, MAX_ZOOM)
      cam.setZoom(newZoom)
      if (newZoom <= MIN_ZOOM) {
        this.resetCamera()
      } else {
        this.clampCamera()
      }
    })

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.input.pointer1.isDown && this.input.pointer2.isDown) return
      isDown = true
      hasMoved = false
      startX = pointer.x
      startY = pointer.y
      lastPointerX = pointer.x
      lastPointerY = pointer.y
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      // Pinch zoom
      if (this.input.pointer1.isDown && this.input.pointer2.isDown) {
        wasPinching = true
        isDown = false
        const p1 = this.input.pointer1
        const p2 = this.input.pointer2
        const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y)
        if (pinchDistance > 0) {
          const zoomDelta = (dist - pinchDistance) * 0.005
          const newZoom = Phaser.Math.Clamp(cam.zoom + zoomDelta, MIN_ZOOM, MAX_ZOOM)
          cam.setZoom(newZoom)
          if (newZoom <= MIN_ZOOM) {
            this.resetCamera()
          } else {
            this.clampCamera()
          }
        }
        pinchDistance = dist
        return
      }

      if (!isDown) return

      const movedDist = Phaser.Math.Distance.Between(startX, startY, pointer.x, pointer.y)
      if (movedDist > TAP_MOVE_THRESHOLD) {
        hasMoved = true
      }

      // Pan only when zoomed in
      if (hasMoved && cam.zoom > MIN_ZOOM) {
        const dx = (lastPointerX - pointer.x) / cam.zoom
        const dy = (lastPointerY - pointer.y) / cam.zoom
        cam.scrollX += dx
        cam.scrollY += dy
        this.clampCamera()
      }
      lastPointerX = pointer.x
      lastPointerY = pointer.y
    })

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (wasPinching) {
        if (!this.input.pointer1.isDown && !this.input.pointer2.isDown) {
          wasPinching = false
          pinchDistance = 0
        }
        isDown = false
        return
      }

      // Tap → double-tap detection
      if (isDown && !hasMoved) {
        const now = Date.now()
        if (now - lastTapTime < 300) {
          if (cam.zoom > MIN_ZOOM + 0.1) {
            cam.setZoom(MIN_ZOOM)
            this.resetCamera()
          } else {
            const worldPoint = cam.getWorldPoint(pointer.x, pointer.y)
            cam.setZoom(2)
            cam.centerOn(worldPoint.x, worldPoint.y)
            this.clampCamera()
          }
          lastTapTime = 0
        } else {
          lastTapTime = now
        }
      }

      isDown = false
      hasMoved = false
      pinchDistance = 0
    })
  }

  private resetCamera() {
    const cam = this.cameras.main
    const W = this.scale.width
    const H = this.scale.height
    cam.centerOn(W / 2, H / 2)
  }

  private clampCamera() {
    const cam = this.cameras.main
    const W = this.scale.width
    const H = this.scale.height
    const viewW = W / cam.zoom
    const viewH = H / cam.zoom
    const cx = cam.scrollX + viewW / 2
    const cy = cam.scrollY + viewH / 2
    const clampedX = Phaser.Math.Clamp(cx, viewW / 2, W - viewW / 2)
    const clampedY = Phaser.Math.Clamp(cy, viewH / 2, H - viewH / 2)
    cam.centerOn(clampedX, clampedY)
  }

  private setupResizeHandler() {
    // When screen rotates or resizes, re-render everything
    this.scale.on('resize', () => {
      this.cameras.main.setZoom(1)
      this.scene.restart({ roomData: this.roomData })
    })
  }

  private setupEvents() {
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

  private drawCharacter(cx: number, floorY: number, s: number = 1) {
    const char = this.roomData.character
    const color = hexToNumber(char.color)
    const depth = 100

    const g = this.add.graphics()

    // Shadow
    g.fillStyle(0x000000, 0.15)
    g.fillEllipse(cx, floorY + 2 * s, 30 * s, 15 * s)

    if (char.shape === 'circle') {
      g.fillStyle(color, 1)
      g.fillCircle(cx, floorY - 28 * s, 14 * s)
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
