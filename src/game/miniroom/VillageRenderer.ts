import type { VillageStoreRoom, VillageEmptySlot } from './VillageConfig'
import { hexToPixel } from '@/utils/hexGridUtils'

/**
 * Isometric cube village renderer.
 * Room images are displayed as-is (no hex masking) — the transparent areas
 * in each isometric PNG handle seamless tessellation naturally.
 * Empty slots rendered as dashed isometric hexagon + "+" for owner to add stores.
 */

/** Cube display size: width = 7/4 × size, height = 2 × size (7:8 aspect) */
export const CUBE_SIZE_RATIO = 7 / 4

/** Get 6 vertices of an isometric cube silhouette (hexagon) centered at (cx, cy) */
function cubeHexPoints(cx: number, cy: number, cubeW: number, cubeH: number) {
  return [
    { x: cx, y: cy - cubeH * 0.5 },            // top
    { x: cx + cubeW * 0.5, y: cy - cubeH * 0.25 }, // upper-right
    { x: cx + cubeW * 0.5, y: cy + cubeH * 0.25 }, // lower-right
    { x: cx, y: cy + cubeH * 0.5 },            // bottom
    { x: cx - cubeW * 0.5, y: cy + cubeH * 0.25 }, // lower-left
    { x: cx - cubeW * 0.5, y: cy - cubeH * 0.25 }, // upper-left
  ]
}

export class VillageRenderer {
  private scene: Phaser.Scene
  private rooms: VillageStoreRoom[]
  private emptySlots: VillageEmptySlot[]
  private hexSize: number
  private worldCX: number
  private worldCY: number
  private objects: Phaser.GameObjects.GameObject[] = []

  constructor(
    scene: Phaser.Scene,
    rooms: VillageStoreRoom[],
    emptySlots: VillageEmptySlot[],
    hexSize: number,
    worldCenterX: number,
    worldCenterY: number,
  ) {
    this.scene = scene
    this.rooms = rooms
    this.emptySlots = emptySlots
    this.hexSize = hexSize
    this.worldCX = worldCenterX
    this.worldCY = worldCenterY
  }

  /** Render light diamond placeholders (shown until images load) */
  renderPlaceholders() {
    const g = this.scene.add.graphics()
    g.setDepth(0)
    this.objects.push(g)

    const cubeW = CUBE_SIZE_RATIO * this.hexSize
    const cubeH = 2 * this.hexSize

    for (const room of this.rooms) {
      const pixel = hexToPixel(room.gridQ, room.gridR, this.hexSize)
      const px = this.worldCX + pixel.x
      const py = this.worldCY + pixel.y

      // Draw isometric cube hexagon placeholder
      const pts = cubeHexPoints(px, py, cubeW, cubeH)
      g.fillStyle(0xe5e7eb, 0.5)
      g.beginPath()
      g.moveTo(pts[0]!.x, pts[0]!.y)
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i]!.x, pts[i]!.y)
      g.closePath()
      g.fillPath()
    }
  }

  /** Render empty slot placeholders with dashed diamond + "+" text */
  renderEmptySlots() {
    if (this.emptySlots.length === 0) return

    const cubeW = CUBE_SIZE_RATIO * this.hexSize
    const cubeH = 2 * this.hexSize

    for (const slot of this.emptySlots) {
      const pixel = hexToPixel(slot.gridQ, slot.gridR, this.hexSize)
      const px = this.worldCX + pixel.x
      const py = this.worldCY + pixel.y

      // Dashed isometric hexagon outline
      const g = this.scene.add.graphics()
      g.lineStyle(2, 0xc4c4c4, 0.6)

      const points = cubeHexPoints(px, py, cubeW, cubeH)
      for (let i = 0; i < 6; i++) {
        const from = points[i]!
        const to = points[(i + 1) % 6]!
        // Draw dashed line segments
        const segments = 4
        for (let s = 0; s < segments; s += 2) {
          const t1 = s / segments
          const t2 = (s + 1) / segments
          g.beginPath()
          g.moveTo(from.x + (to.x - from.x) * t1, from.y + (to.y - from.y) * t1)
          g.lineTo(from.x + (to.x - from.x) * t2, from.y + (to.y - from.y) * t2)
          g.strokePath()
        }
      }
      g.setDepth(5 + py)
      this.objects.push(g)

      // "+" text in center
      const fontSize = Math.max(16, this.hexSize * 0.4)
      const plus = this.scene.add.text(px, py, '+', {
        fontFamily: 'Noto Sans KR, sans-serif',
        fontSize: `${fontSize}px`,
        color: '#b0b0b0',
        fontStyle: 'bold',
      })
      plus.setOrigin(0.5, 0.5)
      plus.setDepth(6 + py)
      this.objects.push(plus)

      // Interactive hit area for empty slot tap
      const hitZone = this.scene.add.zone(px, py, cubeW * 0.8, cubeH * 0.8)
      hitZone.setInteractive()
      hitZone.setDepth(7 + py)
      hitZone.on('pointerup', () => {
        window.dispatchEvent(
          new CustomEvent('miniroom-empty-slot-tap', {
            detail: { slotQ: slot.gridQ, slotR: slot.gridR },
          }),
        )
      })
      this.objects.push(hitZone)
    }
  }

  /** Start parallel loading of store room images using native Image() */
  startImageLoading() {
    if (this.rooms.length === 0) return

    for (const room of this.rooms) {
      if (!room.roomImageUrl) continue
      const key = `storeroom_${room.id}`
      if (this.scene.textures.exists(key)) {
        this.onImageLoaded(room)
        continue
      }

      // Parallel load via native Image — browser handles 6-8 concurrent downloads
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        if (this.scene && this.scene.textures && !this.scene.textures.exists(key)) {
          this.scene.textures.addImage(key, img)
        }
        this.onImageLoaded(room)
      }
      img.onerror = () => {
        console.warn('Failed to load store room image:', key)
      }
      img.src = room.roomImageUrl
    }
  }

  /** Called when a store room image finishes loading */
  private onImageLoaded(room: VillageStoreRoom) {
    const key = `storeroom_${room.id}`
    if (!this.scene.textures.exists(key)) return

    const pixel = hexToPixel(room.gridQ, room.gridR, this.hexSize)
    const px = this.worldCX + pixel.x
    const py = this.worldCY + pixel.y

    // Scale by width to fit cell — trimmed images have no excess transparent margin
    const cubeW = CUBE_SIZE_RATIO * this.hexSize
    const img = this.scene.add.image(px, py, key)
    const tex = this.scene.textures.get(key).getSourceImage()
    const scale = cubeW / tex.width
    img.setScale(scale)

    // Depth: higher Y (lower on screen) renders on top — painter's algorithm
    img.setDepth(10 + py)

    // Interactive: alpha-aware hit testing
    img.setInteractive({ pixelPerfect: true, alphaTolerance: 128 })
    img.on('pointerup', () => {
      window.dispatchEvent(
        new CustomEvent('miniroom-store-tap', { detail: { room } }),
      )
    })

    this.objects.push(img)

    // AD badge for ad rooms
    if (room.isAd) {
      const cubeH = 2 * this.hexSize
      const badgeFontSize = Math.max(8, this.hexSize * 0.18)
      const badge = this.scene.add.text(px, py - cubeH * 0.35, 'AD', {
        fontFamily: 'Noto Sans KR, sans-serif',
        fontSize: `${badgeFontSize}px`,
        color: '#ffffff',
        backgroundColor: '#FF6B35',
        padding: { x: 4, y: 2 },
      })
      badge.setOrigin(0.5, 0.5).setDepth(11 + py)
      this.objects.push(badge)
    }

    // N badge for random/recommended rooms — circular with pulse animation
    if (room.isRandom) {
      const cubeH = 2 * this.hexSize
      const cubeW2 = CUBE_SIZE_RATIO * this.hexSize
      const badgeRadius = Math.max(8, this.hexSize * 0.14)
      const badgeX = px + cubeW2 * 0.32
      const badgeY = py - cubeH * 0.38

      // Pulse ring (animated glow)
      const pulseRing = this.scene.add.graphics()
      pulseRing.fillStyle(0x8B5CF6, 0.3)
      pulseRing.fillCircle(badgeX, badgeY, badgeRadius * 1.6)
      pulseRing.setDepth(11 + py - 0.2)
      this.objects.push(pulseRing)

      this.scene.tweens.add({
        targets: pulseRing,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: 1200,
        ease: 'Sine.easeOut',
        repeat: -1,
        yoyo: false,
        onRepeat: () => {
          pulseRing.setScale(1)
          pulseRing.setAlpha(1)
        },
      })

      // Solid circle background
      const bg = this.scene.add.graphics()
      bg.fillStyle(0x8B5CF6, 1)
      bg.fillCircle(badgeX, badgeY, badgeRadius)
      bg.setDepth(11 + py)
      this.objects.push(bg)

      // "N" text
      const badgeFontSize = Math.max(7, badgeRadius * 1.2)
      const nText = this.scene.add.text(badgeX, badgeY, 'N', {
        fontFamily: 'Noto Sans KR, sans-serif',
        fontSize: `${badgeFontSize}px`,
        fontStyle: 'bold',
        color: '#ffffff',
      })
      nText.setOrigin(0.5, 0.5).setDepth(11 + py + 0.1)
      this.objects.push(nText)

      // Gentle bounce on the badge group
      this.scene.tweens.add({
        targets: [bg, nText],
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 800,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      })
    }
  }

  /** Cleanup all rendered objects */
  destroy() {
    for (const obj of this.objects) {
      obj.destroy()
    }
    this.objects = []
  }
}
