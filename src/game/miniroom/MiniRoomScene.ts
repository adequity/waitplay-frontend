import type { RoomData, FurnitureType } from './RoomConfig'
import { FURNITURE_SPECS, DEFAULT_ROOM } from './RoomConfig'
import { hexToNumber } from './IsometricUtils'
import type { VillageStoreRoom, VillageEmptySlot } from './VillageConfig'
import { VILLAGE_MAX_ZOOM, VILLAGE_DETAIL_ZOOM, isImageTheme, getImageThemeData, getColorThemeValue, calcHexSize, calcVillageZoom } from './VillageConfig'
import { VillageRenderer, CUBE_SIZE_RATIO } from './VillageRenderer'
import { hexBoundingBox, type HexPosition } from '@/utils/hexGridUtils'

const SPRITE_BASE = '/assets/miniroom/custom/'

export class MiniRoomScene extends Phaser.Scene {
  private roomData: RoomData = DEFAULT_ROOM
  private villageRooms: VillageStoreRoom[] = []
  private emptySlots: VillageEmptySlot[] = []
  private selectedRoomAssetUrl: string | null = null
  private villageTheme: string = 'white'
  private lastW = 0
  private lastH = 0

  // Village mode state
  private hasVillage = false
  private villageRenderer: VillageRenderer | null = null
  private villageMinZoom = 1
  private worldCX = 0
  private worldCY = 0

  constructor() {
    super({ key: 'MiniRoomScene' })
  }

  init(data?: { roomData?: RoomData; villageRooms?: VillageStoreRoom[]; emptySlots?: VillageEmptySlot[]; selectedRoomAssetUrl?: string; villageTheme?: string }) {
    if (data?.roomData) {
      this.roomData = data.roomData
    } else if ((this as any)._initialRoomData) {
      this.roomData = (this as any)._initialRoomData as RoomData
      delete (this as any)._initialRoomData
    }

    if (data?.villageRooms !== undefined) {
      this.villageRooms = data.villageRooms
    } else if ((this as any)._initialVillageRooms) {
      this.villageRooms = (this as any)._initialVillageRooms as VillageStoreRoom[]
      delete (this as any)._initialVillageRooms
    }

    if (data?.emptySlots !== undefined) {
      this.emptySlots = data.emptySlots
    } else if ((this as any)._initialEmptySlots) {
      this.emptySlots = (this as any)._initialEmptySlots as VillageEmptySlot[]
      delete (this as any)._initialEmptySlots
    }

    if (data?.selectedRoomAssetUrl) {
      this.selectedRoomAssetUrl = data.selectedRoomAssetUrl
    } else if ((this as any)._initialSelectedRoomAssetUrl) {
      this.selectedRoomAssetUrl = (this as any)._initialSelectedRoomAssetUrl as string
      delete (this as any)._initialSelectedRoomAssetUrl
    }

    if (data?.villageTheme) {
      this.villageTheme = data.villageTheme
    } else if ((this as any)._initialVillageTheme) {
      this.villageTheme = (this as any)._initialVillageTheme as string
      delete (this as any)._initialVillageTheme
    }
  }

  preload() {
    // If user has a selected room asset, load that instead of the preset theme
    if (this.selectedRoomAssetUrl) {
      if (!this.textures.exists('user_room_asset')) {
        this.load.image('user_room_asset', this.selectedRoomAssetUrl)
      }
    }

    // Load village theme background image if applicable
    const themeImgData = getImageThemeData(this.villageTheme)
    if (themeImgData && !this.textures.exists('village_theme_bg')) {
      this.load.image('village_theme_bg', themeImgData.imageUrl)
    }

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
    this.lastW = this.scale.width
    this.lastH = this.scale.height
    this.hasVillage = this.villageRooms.length > 0 || this.emptySlots.length > 0

    if (this.hasVillage) {
      this.createVillageMode()
    } else {
      this.renderRoom()
    }

    this.setupCameraControls()
    this.setupResizeHandler()
    this.setupEvents()
  }

  private createVillageMode() {
    const W = this.scale.width
    const H = this.scale.height
    const hexSize = calcHexSize(W, H)

    // Compute world bounds from all positions (filled + empty)
    const allPositions: HexPosition[] = [
      ...this.villageRooms.map(r => ({ q: r.gridQ, r: r.gridR })),
      ...this.emptySlots.map(s => ({ q: s.gridQ, r: s.gridR })),
    ]
    const bounds = hexBoundingBox(allPositions, hexSize)
    const padding = hexSize * 1.5
    const worldW = bounds.width + padding * 2
    const worldH = bounds.height + padding * 2

    this.worldCX = -bounds.minX + padding
    this.worldCY = -bounds.minY + padding

    // Set camera world bounds
    const cam = this.cameras.main
    cam.setBounds(0, 0, worldW, worldH)

    // Themed background — image or color
    if (isImageTheme(this.villageTheme) && this.textures.exists('village_theme_bg')) {
      const bgImg = this.add.image(worldW / 2, worldH / 2, 'village_theme_bg')
      const tex = this.textures.get('village_theme_bg').getSourceImage()
      const scale = Math.max(worldW / tex.width, worldH / tex.height)
      bgImg.setScale(scale)
      bgImg.setDepth(-200)
    } else {
      const bgColor = getColorThemeValue(this.villageTheme)
      const bg = this.add.graphics()
      bg.fillStyle(bgColor, 1)
      bg.fillRect(0, 0, worldW, worldH)
      bg.setDepth(-200)
    }

    // Render center room (user's own room)
    this.renderRoom(this.worldCX, this.worldCY, hexSize)

    // Render village hex grid
    this.villageRenderer = new VillageRenderer(
      this, this.villageRooms, this.emptySlots, hexSize, this.worldCX, this.worldCY,
    )
    this.villageRenderer.renderPlaceholders()
    this.villageRenderer.renderEmptySlots()
    this.villageRenderer.startImageLoading()

    // Zoom-in entrance: start zoomed out from center, smoothly zoom into user's room
    this.villageMinZoom = calcVillageZoom(worldW, worldH, W, H)
    const targetZoom = Math.max(VILLAGE_DETAIL_ZOOM, this.villageMinZoom)
    // Start at 60% of target zoom — enough to see surroundings without showing edges
    const entryZoom = targetZoom * 0.6
    cam.setZoom(entryZoom)
    cam.centerOn(this.worldCX, this.worldCY)

    // Smooth zoom-in tween centered on user's room
    this.tweens.add({
      targets: { zoom: entryZoom },
      zoom: targetZoom,
      duration: 1200,
      ease: 'Cubic.easeOut',
      delay: 150,
      onUpdate: (_tween: Phaser.Tweens.Tween, target: { zoom: number }) => {
        cam.setZoom(target.zoom)
        cam.centerOn(this.worldCX, this.worldCY)
      },
    })
  }

  private renderRoom(centerX?: number, centerY?: number, hexSize?: number) {
    const W = this.scale.width
    const H = this.scale.height
    const cx = centerX ?? W / 2
    const cy = centerY ?? H / 2

    // Use user's selected room asset if available, otherwise fall back to preset theme
    const userAssetKey = this.selectedRoomAssetUrl && this.textures.exists('user_room_asset') ? 'user_room_asset' : null
    const roomKey = userAssetKey || `room_${this.roomData.wallTheme || 'default'}`
    if (this.textures.exists(roomKey)) {
      const roomBg = this.add.image(cx, cy, roomKey)
      const tex = this.textures.get(roomKey).getSourceImage()

      if (this.hasVillage && hexSize) {
        // Village mode: scale by width — trimmed images fit cell naturally
        const cubeW = CUBE_SIZE_RATIO * hexSize
        const scale = cubeW / tex.width
        roomBg.setScale(scale)
        roomBg.setDepth(10 + cy)

        const imgH = tex.height * scale
        const imgTop = cy - imgH / 2
        const charY = imgTop + imgH * 0.78
        const charScale = Math.max((imgH / 600) * 1.2, 0.5)
        this.drawCharacter(cx, charY, charScale)
      } else {
        // Normal mode: fill viewport
        const isLandscape = W > H
        const scaleX = W / tex.width
        const scaleY = H / tex.height
        const scale = isLandscape ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY)
        roomBg.setScale(scale)
        roomBg.setDepth(-100)
        const imgH = tex.height * scale
        const imgTop = cy - imgH / 2
        const charY = imgTop + imgH * 0.78
        const charScale = Math.max((imgH / 600) * 1.2, 0.5)
        this.drawCharacter(cx, charY, charScale)
      }
    } else {
      if (!this.hasVillage) {
        this.drawFallbackBackground(W, H)
      }
      this.drawCharacter(cx, cy + (hexSize || H * 0.25) * 0.5, this.hasVillage ? 0.6 : 1)
    }
  }

  private setupCameraControls() {
    const cam = this.cameras.main
    const MIN_ZOOM = this.hasVillage ? this.villageMinZoom : 1
    const MAX_ZOOM = this.hasVillage ? VILLAGE_MAX_ZOOM : 3
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
      if (!this.hasVillage) {
        if (newZoom <= MIN_ZOOM) this.resetCamera()
        else this.clampCamera()
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
          if (!this.hasVillage) {
            if (newZoom <= MIN_ZOOM) this.resetCamera()
            else this.clampCamera()
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

      // Pan: always in village mode, only when zoomed in normal mode
      const canPan = this.hasVillage || cam.zoom > MIN_ZOOM
      if (hasMoved && canPan) {
        const dx = (lastPointerX - pointer.x) / cam.zoom
        const dy = (lastPointerY - pointer.y) / cam.zoom
        cam.scrollX += dx
        cam.scrollY += dy
        if (!this.hasVillage) this.clampCamera()
      }
      lastPointerX = pointer.x
      lastPointerY = pointer.y
    })

    this.input.on('pointerup', (_pointer: Phaser.Input.Pointer) => {
      const pointer = _pointer
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
        const elapsed = now - lastTapTime
        if (elapsed < 300 && lastTapTime > 0) {
          if (this.hasVillage) {
            // Village: toggle overview ↔ detail
            if (cam.zoom > MIN_ZOOM + 0.05) {
              cam.setZoom(MIN_ZOOM)
              cam.centerOn(this.worldCX, this.worldCY)
            } else {
              cam.setZoom(VILLAGE_DETAIL_ZOOM)
              const wp = cam.getWorldPoint(pointer.x, pointer.y)
              cam.centerOn(wp.x, wp.y)
            }
          } else {
            // Normal: toggle 1x ↔ 2x
            if (cam.zoom > MIN_ZOOM + 0.1) {
              cam.setZoom(MIN_ZOOM)
              this.resetCamera()
            } else {
              const worldPoint = cam.getWorldPoint(pointer.x, pointer.y)
              cam.setZoom(2)
              cam.centerOn(worldPoint.x, worldPoint.y)
              this.clampCamera()
            }
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
    if (this.hasVillage) {
      cam.centerOn(this.worldCX, this.worldCY)
    } else {
      const W = this.scale.width
      const H = this.scale.height
      cam.centerOn(W / 2, H / 2)
    }
  }

  private clampCamera() {
    if (this.hasVillage) return // camera.setBounds handles it
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
    const resizeHandler = (gameSize: { width: number; height: number }) => {
      const newW = gameSize.width
      const newH = gameSize.height
      if (Math.abs(newW - this.lastW) > 1 || Math.abs(newH - this.lastH) > 1) {
        this.cameras.main.setZoom(1)
        this.scene.restart({ roomData: this.roomData, villageRooms: this.villageRooms, emptySlots: this.emptySlots, selectedRoomAssetUrl: this.selectedRoomAssetUrl ?? undefined, villageTheme: this.villageTheme })
      }
    }
    this.scale.on('resize', resizeHandler)

    const orientationHandler = () => {
      setTimeout(() => { this.scale.refresh() }, 300)
    }
    window.addEventListener('orientationchange', orientationHandler)
    this.events.on('shutdown', () => {
      this.scale.off('resize', resizeHandler)
      window.removeEventListener('orientationchange', orientationHandler)
      this.villageRenderer?.destroy()
      this.villageRenderer = null
    })
  }

  private setupEvents() {
    window.dispatchEvent(new CustomEvent('miniroom-ready'))

    const updateHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.roomData) {
        this.roomData = detail.roomData
        this.scene.restart({ roomData: this.roomData, villageRooms: this.villageRooms, emptySlots: this.emptySlots, villageTheme: this.villageTheme })
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

    g.fillStyle(0xFFFFFF, 1)
    g.fillCircle(cx - 5 * s, floorY - 32 * s, 3 * s)
    g.fillCircle(cx + 5 * s, floorY - 32 * s, 3 * s)
    g.fillStyle(0x333333, 1)
    g.fillCircle(cx - 4 * s, floorY - 31 * s, 2 * s)
    g.fillCircle(cx + 6 * s, floorY - 31 * s, 2 * s)

    g.setDepth(depth)
  }
}
