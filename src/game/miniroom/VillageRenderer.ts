import type { VillageStoreRoom } from './VillageConfig'
import { hexToPixel } from '@/utils/hexGridUtils'

/**
 * Isometric cube village renderer.
 * Room images are displayed as-is (no hex masking) — the transparent areas
 * in each isometric PNG handle seamless tessellation naturally.
 */

/** Cube display size: width = 7/4 × size, height = 2 × size (7:8 aspect) */
export const CUBE_SIZE_RATIO = 7 / 4

export class VillageRenderer {
  private scene: Phaser.Scene
  private rooms: VillageStoreRoom[]
  private hexSize: number
  private worldCX: number
  private worldCY: number
  private objects: Phaser.GameObjects.GameObject[] = []

  constructor(
    scene: Phaser.Scene,
    rooms: VillageStoreRoom[],
    hexSize: number,
    worldCenterX: number,
    worldCenterY: number,
  ) {
    this.scene = scene
    this.rooms = rooms
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

      // Draw diamond placeholder matching isometric cube silhouette
      g.fillStyle(0xe5e7eb, 0.5)
      g.beginPath()
      g.moveTo(px, py - cubeH / 2) // top
      g.lineTo(px + cubeW / 2, py)  // right
      g.lineTo(px, py + cubeH / 2) // bottom
      g.lineTo(px - cubeW / 2, py)  // left
      g.closePath()
      g.fillPath()
    }
  }

  /** Start async loading of store room images */
  startImageLoading() {
    if (this.rooms.length === 0) return

    for (const room of this.rooms) {
      const key = `storeroom_${room.id}`
      if (!this.scene.textures.exists(key)) {
        this.scene.load.image(key, room.roomImageUrl)

        this.scene.load.on(`filecomplete-image-${key}`, () => {
          this.onImageLoaded(room)
        })
      } else {
        this.onImageLoaded(room)
      }
    }

    this.scene.load.on('loaderror', (file: { key: string }) => {
      console.warn('Failed to load store room image:', file.key)
    })

    this.scene.load.start()
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
  }

  /** Cleanup all rendered objects */
  destroy() {
    for (const obj of this.objects) {
      obj.destroy()
    }
    this.objects = []
  }
}
