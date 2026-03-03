import type { VillageStoreRoom } from './VillageConfig'
import {
  HEX_STROKE_COLOR, HEX_GHOST_FILL_ALPHA,
  HEX_LABEL_STYLE, GHOST_RING_EXTRA, MAX_GHOST_RING,
} from './VillageConfig'
import { hexToPixel, spiralPositions, neededRings } from '@/utils/hexGridUtils'

/** Flat-top hex vertex at given index (0..5) */
function hexVertex(cx: number, cy: number, size: number, i: number) {
  const angle = (Math.PI / 3) * i
  return { x: cx + size * Math.cos(angle), y: cy + size * Math.sin(angle) }
}

/** Draw flat-top hex path on graphics */
function drawHexPath(g: Phaser.GameObjects.Graphics, cx: number, cy: number, size: number) {
  g.beginPath()
  for (let i = 0; i < 6; i++) {
    const v = hexVertex(cx, cy, size, i)
    i === 0 ? g.moveTo(v.x, v.y) : g.lineTo(v.x, v.y)
  }
  g.closePath()
}

/** Get hex vertices as Phaser Point array (for hit area) */
function getHexPoints(cx: number, cy: number, size: number): Phaser.Geom.Point[] {
  const pts: Phaser.Geom.Point[] = []
  for (let i = 0; i < 6; i++) {
    const v = hexVertex(cx, cy, size, i)
    pts.push(new Phaser.Geom.Point(v.x - cx, v.y - cy))
  }
  return pts
}

/** Parse hex color string to number */
function hexColorToNum(hex: string): number {
  const clean = hex.replace('#', '')
  return parseInt(clean, 16) || 0x6366F1
}

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

  /** Render colored hex placeholders for each store room */
  renderPlaceholders() {
    const g = this.scene.add.graphics()
    g.setDepth(0)
    this.objects.push(g)

    for (const room of this.rooms) {
      const pixel = hexToPixel(room.gridQ, room.gridR, this.hexSize)
      const px = this.worldCX + pixel.x
      const py = this.worldCY + pixel.y

      g.fillStyle(hexColorToNum(room.roomColor), 0.85)
      drawHexPath(g, px, py, this.hexSize * 0.98)
      g.fillPath()

      // Thin border
      g.lineStyle(1, 0xffffff, 0.3)
      drawHexPath(g, px, py, this.hexSize * 0.98)
      g.strokePath()
    }
  }

  /** Render ghost cells (empty hex positions as hints) */
  renderGhostCells() {
    const rings = neededRings(this.rooms.length)
    const displayRing = Math.min(rings + GHOST_RING_EXTRA, MAX_GHOST_RING)

    const occupied = new Set<string>()
    occupied.add('0,0') // center = user room
    for (const room of this.rooms) {
      occupied.add(`${room.gridQ},${room.gridR}`)
    }

    const allPositions = spiralPositions(displayRing)
    const ghostPositions = allPositions.filter(
      pos => !occupied.has(`${pos.q},${pos.r}`)
    )

    const g = this.scene.add.graphics()
    g.setDepth(-50)
    this.objects.push(g)

    for (const pos of ghostPositions) {
      const pixel = hexToPixel(pos.q, pos.r, this.hexSize)
      const px = this.worldCX + pixel.x
      const py = this.worldCY + pixel.y

      // Faint fill
      g.fillStyle(0x000000, HEX_GHOST_FILL_ALPHA)
      drawHexPath(g, px, py, this.hexSize * 0.96)
      g.fillPath()

      // Dashed outline effect (solid thin line)
      g.lineStyle(1, HEX_STROKE_COLOR, 0.3)
      drawHexPath(g, px, py, this.hexSize * 0.96)
      g.strokePath()

      // "?" text
      const q = this.scene.add.text(px, py, '?', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#D1D1D6',
        align: 'center',
      }).setOrigin(0.5).setDepth(-49)
      this.objects.push(q)
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
        // Already loaded (e.g., scene restart)
        this.onImageLoaded(room)
      }
    }

    this.scene.load.on('loaderror', (file: { key: string }) => {
      // Keep placeholder on error
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

    const hexW = this.hexSize * 2
    const hexH = this.hexSize * Math.sqrt(3)

    // Create image and scale to cover hex
    const img = this.scene.add.image(px, py, key)
    const tex = this.scene.textures.get(key).getSourceImage()
    const scaleX = hexW / tex.width
    const scaleY = hexH / tex.height
    const scale = Math.max(scaleX, scaleY)
    img.setScale(scale)
    img.setDepth(1)

    // Create hex geometry mask
    const maskG = this.scene.make.graphics({ x: 0, y: 0, add: false })
    maskG.fillStyle(0xffffff)
    drawHexPath(maskG, px, py, this.hexSize * 0.98)
    maskG.fillPath()
    const mask = maskG.createGeometryMask()
    img.setMask(mask)

    // Interactive hit area (hex polygon)
    const hitPoly = new Phaser.Geom.Polygon(getHexPoints(px, py, this.hexSize))
    img.setInteractive(hitPoly, Phaser.Geom.Polygon.Contains)
    img.on('pointerup', () => {
      window.dispatchEvent(
        new CustomEvent('miniroom-store-tap', { detail: { room } })
      )
    })

    this.objects.push(img)

    // Store name label below hex
    const labelY = py + hexH / 2 + 6
    const label = this.scene.add.text(px, labelY, room.storeName, HEX_LABEL_STYLE)
      .setOrigin(0.5, 0)
      .setDepth(2)
    this.objects.push(label)
  }

  /** Cleanup all rendered objects */
  destroy() {
    for (const obj of this.objects) {
      obj.destroy()
    }
    this.objects = []
  }
}
