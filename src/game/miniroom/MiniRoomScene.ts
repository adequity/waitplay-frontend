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
      // Scale to fill screen while maintaining aspect ratio
      const tex = this.textures.get(roomKey).getSourceImage()
      const scaleX = W / tex.width
      const scaleY = H / tex.height
      const scale = Math.max(scaleX, scaleY)
      roomBg.setScale(scale)
      roomBg.setDepth(-100)
    } else {
      // Fallback: solid gradient background
      this.drawFallbackBackground(W, H)
    }

    // --- Layer 1 & 2: Additional furniture + character ---
    this.drawFurnitureAndCharacter(W, H)

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

  private drawFurnitureAndCharacter(screenW: number, screenH: number) {
    // If no additional furniture, only draw character
    if (this.roomData.furniture.length === 0) {
      this.drawCharacter(screenW / 2, screenH * 0.65)
      return
    }

    // Map grid positions to screen positions
    // The room image occupies the full screen, so we map grid coords
    // to screen space based on ISO_CONFIG
    const { gridCols, gridRows, tileWidth, tileHeight } = ISO_CONFIG

    // Calculate the isometric grid bounds in abstract space
    const topLeft = gridToIso(0, 0)
    const topRight = gridToIso(gridCols, 0)
    const bottomLeft = gridToIso(0, gridRows)
    const bottomRight = gridToIso(gridCols, gridRows)

    const isoWidth = topRight.x - bottomLeft.x
    const isoTop = topLeft.y
    const isoBottom = bottomRight.y + tileHeight / 2

    // Map to screen: the floor area should roughly occupy the center-bottom of screen
    const floorScreenWidth = screenW * 0.75
    const scale = floorScreenWidth / isoWidth
    const originX = screenW / 2
    const originY = screenH * 0.35  // floor starts around 35% from top

    interface Renderable {
      depth: number
      render: () => void
    }

    const renderables: Renderable[] = []

    for (const item of this.roomData.furniture) {
      const spec = FURNITURE_SPECS[item.type as FurnitureType]
      if (!spec) continue
      renderables.push({
        depth: getDepthValue(item.gridX, item.gridY),
        render: () => {
          const iso = gridToIso(item.gridX, item.gridY)
          const x = originX + iso.x * scale
          const floorY = originY + (iso.y + tileHeight / 2) * scale
          const depth = getDepthValue(item.gridX, item.gridY)

          // Shadow
          const shadow = this.add.graphics()
          shadow.fillStyle(0x000000, 0.08)
          shadow.fillEllipse(x, floorY, spec.widthTiles * 35 * scale, spec.heightTiles * 18 * scale)
          shadow.setDepth(depth - 0.1)

          // Sprite
          if (this.textures.exists(spec.sprite)) {
            const img = this.add.image(x, floorY, spec.sprite)
            img.setScale(spec.displayScale * scale)
            img.setOrigin(0.5, 1)
            img.setDepth(depth)
          }
        },
      })
    }

    // Character
    const charGridX = 2.5
    const charGridY = 2.5
    renderables.push({
      depth: getDepthValue(charGridX, charGridY),
      render: () => {
        const iso = gridToIso(charGridX, charGridY)
        const cx = originX + iso.x * scale
        const floorY = originY + (iso.y + tileHeight / 2) * scale
        this.drawCharacter(cx, floorY)
      },
    })

    renderables.sort((a, b) => a.depth - b.depth)
    for (const r of renderables) {
      r.render()
    }
  }

  private drawCharacter(cx: number, floorY: number) {
    const char = this.roomData.character
    const color = hexToNumber(char.color)
    const depth = 100 // character always on top of most things

    const g = this.add.graphics()

    // Shadow
    g.fillStyle(0x000000, 0.15)
    g.fillEllipse(cx, floorY + 2, 30, 15)

    if (char.shape === 'circle') {
      g.fillStyle(color, 1)
      g.fillCircle(cx, floorY - 28, 14)
      g.fillStyle(color, 0.85)
      g.fillRoundedRect(cx - 10, floorY - 16, 20, 16, 5)
    } else {
      g.fillStyle(color, 1)
      g.fillRoundedRect(cx - 12, floorY - 40, 24, 38, 8)
    }

    // Eyes
    g.fillStyle(0xFFFFFF, 1)
    g.fillCircle(cx - 5, floorY - 32, 3)
    g.fillCircle(cx + 5, floorY - 32, 3)
    g.fillStyle(0x333333, 1)
    g.fillCircle(cx - 4, floorY - 31, 2)
    g.fillCircle(cx + 6, floorY - 31, 2)

    g.setDepth(depth)
  }
}
