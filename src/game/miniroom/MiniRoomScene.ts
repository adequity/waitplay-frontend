import type { RoomData, RoomFurniture, FurnitureType, FurnitureSpec } from './RoomConfig'
import { FURNITURE_SPECS, WALL_THEMES, ISO_CONFIG, DEFAULT_ROOM } from './RoomConfig'
import { gridToIso, getDepthValue, hexToNumber } from './IsometricUtils'

const SPRITE_BASE = '/assets/miniroom/'

export class MiniRoomScene extends Phaser.Scene {
  private roomData: RoomData = DEFAULT_ROOM
  // World-space origin (center of grid top edge)
  private originX = 0
  private originY = 0

  constructor() {
    super({ key: 'MiniRoomScene' })
  }

  init(data?: { roomData?: RoomData }) {
    if (data?.roomData) {
      this.roomData = data.roomData
    }
  }

  preload() {
    if (!this.textures.exists('floorTile')) {
      this.load.image('floorTile', SPRITE_BASE + 'floorFull_SE.png')
    }

    const loaded = new Set<string>()
    for (const item of this.roomData.furniture) {
      const spec = FURNITURE_SPECS[item.type as FurnitureType]
      if (!spec || loaded.has(spec.sprite)) continue
      loaded.add(spec.sprite)
      if (!this.textures.exists(spec.sprite)) {
        this.load.image(spec.sprite, SPRITE_BASE + spec.sprite)
      }
    }
  }

  create() {
    const { gridCols, gridRows, tileWidth, tileHeight } = ISO_CONFIG

    // Calculate world-space bounds of the grid
    const topLeft = gridToIso(0, 0)
    const topRight = gridToIso(gridCols, 0)
    const bottomLeft = gridToIso(0, gridRows)
    const bottomRight = gridToIso(gridCols, gridRows)

    const worldWidth = topRight.x - bottomLeft.x    // full horizontal span
    const worldTop = topLeft.y - ISO_CONFIG.wallHeight
    const worldBottom = bottomRight.y + tileHeight   // extra for 3D extrusion
    const worldHeight = worldBottom - worldTop

    // Place origin at grid (0,0) top vertex position in world space
    this.originX = 0
    this.originY = 0

    // Calculate zoom to fit world into screen
    const W = this.scale.width
    const H = this.scale.height
    const padding = 0.9  // 90% of screen
    const zoomX = (W * padding) / worldWidth
    const zoomY = (H * padding) / worldHeight
    const zoom = Math.min(zoomX, zoomY)

    // Center camera on the middle of the room
    const centerX = (topRight.x + bottomLeft.x) / 2
    const centerY = (worldTop + worldBottom) / 2
    this.cameras.main.setZoom(zoom)
    this.cameras.main.centerOn(centerX, centerY)

    this.drawBackground(worldWidth, worldHeight, centerX, centerY, zoom)
    this.drawWall()
    this.drawFloor()
    this.drawFurnitureAndCharacter()

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

  private drawBackground(worldWidth: number, worldHeight: number, cx: number, cy: number, zoom: number) {
    // Draw a large background rect that covers the visible area
    const bg = this.add.graphics()
    const size = Math.max(worldWidth, worldHeight) * 3
    const topColor = 0xF0EDE8
    const bottomColor = 0xE0D8D0
    const steps = 40
    for (let i = 0; i < steps; i++) {
      const t = i / steps
      const r = ((topColor >> 16) & 0xff) * (1 - t) + ((bottomColor >> 16) & 0xff) * t
      const g = ((topColor >> 8) & 0xff) * (1 - t) + ((bottomColor >> 8) & 0xff) * t
      const b = (topColor & 0xff) * (1 - t) + (bottomColor & 0xff) * t
      bg.fillStyle((Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b), 1)
      const stripH = size / steps
      bg.fillRect(cx - size / 2, cy - size / 2 + i * stripH, size, stripH + 1)
    }
    bg.setDepth(-100)
  }

  private drawWall() {
    const theme = (WALL_THEMES[this.roomData.wallTheme] ?? WALL_THEMES['default'])!
    const { gridCols, gridRows, wallHeight } = ISO_CONFIG

    const wall = this.add.graphics()

    const topLeft = gridToIso(0, 0)
    const topRight = gridToIso(gridCols, 0)
    const bottomLeft = gridToIso(0, gridRows)

    // Back wall
    wall.fillStyle(theme.wallColor, 1)
    wall.beginPath()
    wall.moveTo(this.originX + topLeft.x, this.originY + topLeft.y)
    wall.lineTo(this.originX + topRight.x, this.originY + topRight.y)
    wall.lineTo(this.originX + topRight.x, this.originY + topRight.y - wallHeight)
    wall.lineTo(this.originX + topLeft.x, this.originY + topLeft.y - wallHeight)
    wall.closePath()
    wall.fillPath()

    // Left wall
    const leftWallColor = (theme.wallColor & 0xFEFEFE) >> 1
    wall.fillStyle(leftWallColor | (theme.wallColor & 0x010101), 0.9)
    wall.beginPath()
    wall.moveTo(this.originX + topLeft.x, this.originY + topLeft.y)
    wall.lineTo(this.originX + bottomLeft.x, this.originY + bottomLeft.y)
    wall.lineTo(this.originX + bottomLeft.x, this.originY + bottomLeft.y - wallHeight)
    wall.lineTo(this.originX + topLeft.x, this.originY + topLeft.y - wallHeight)
    wall.closePath()
    wall.fillPath()

    // Edge lines
    wall.lineStyle(3, theme.wallStroke, 0.6)
    wall.lineBetween(
      this.originX + topLeft.x, this.originY + topLeft.y - wallHeight,
      this.originX + topRight.x, this.originY + topRight.y - wallHeight
    )
    wall.lineBetween(
      this.originX + topLeft.x, this.originY + topLeft.y - wallHeight,
      this.originX + bottomLeft.x, this.originY + bottomLeft.y - wallHeight
    )

    wall.setDepth(-10)
  }

  private drawFloor() {
    const { gridCols, gridRows } = ISO_CONFIG

    // Place Kenney tiles at native 208x152 size — no scaling
    // Diamond top vertex in the image is at pixel (103.5, 0) → origin (103.5/208, 0)
    const originXRatio = 103.5 / 208

    for (let col = 0; col < gridCols; col++) {
      for (let row = 0; row < gridRows; row++) {
        const iso = gridToIso(col, row)
        const tile = this.add.image(
          this.originX + iso.x,
          this.originY + iso.y,
          'floorTile'
        )
        tile.setOrigin(originXRatio, 0)
        tile.setDepth(-5)

        if ((col + row) % 2 === 1) {
          tile.setTint(0xF0F0F0)
        }
      }
    }
  }

  private drawFurnitureAndCharacter() {
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
        render: () => this.drawFurniturePiece(item, spec),
      })
    }

    const charGridX = 2.5
    const charGridY = 2.5
    renderables.push({
      depth: getDepthValue(charGridX, charGridY),
      render: () => this.drawCharacter(charGridX, charGridY),
    })

    renderables.sort((a, b) => a.depth - b.depth)
    for (const r of renderables) {
      r.render()
    }
  }

  private drawFurniturePiece(item: RoomFurniture, spec: FurnitureSpec) {
    const { tileHeight } = ISO_CONFIG
    const iso = gridToIso(item.gridX, item.gridY)
    const depth = getDepthValue(item.gridX, item.gridY)
    const x = this.originX + iso.x
    const floorY = this.originY + iso.y + tileHeight / 2

    // Shadow
    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.1)
    shadow.fillEllipse(x, floorY, spec.widthTiles * 70, spec.heightTiles * 35)
    shadow.setDepth(depth - 0.1)

    // Sprite image - origin at bottom-center
    const img = this.add.image(x, floorY, spec.sprite)
    img.setScale(spec.displayScale)
    img.setOrigin(0.5, 1)
    img.setDepth(depth)
  }

  private drawCharacter(gridX: number, gridY: number) {
    const { tileHeight } = ISO_CONFIG
    const iso = gridToIso(gridX, gridY)
    const char = this.roomData.character
    const color = hexToNumber(char.color)
    const depth = getDepthValue(gridX, gridY)

    const cx = this.originX + iso.x
    const floorY = this.originY + iso.y + tileHeight / 2
    const g = this.add.graphics()

    // Shadow
    g.fillStyle(0x000000, 0.15)
    g.fillEllipse(cx, floorY + 4, 60, 30)

    if (char.shape === 'circle') {
      g.fillStyle(color, 1)
      g.fillCircle(cx, floorY - 55, 30)
      g.fillStyle(color, 0.85)
      g.fillRoundedRect(cx - 20, floorY - 30, 40, 30, 10)
    } else {
      g.fillStyle(color, 1)
      g.fillRoundedRect(cx - 25, floorY - 75, 50, 70, 15)
    }

    // Eyes
    g.fillStyle(0xFFFFFF, 1)
    g.fillCircle(cx - 10, floorY - 60, 6)
    g.fillCircle(cx + 10, floorY - 60, 6)
    g.fillStyle(0x333333, 1)
    g.fillCircle(cx - 8, floorY - 58, 4)
    g.fillCircle(cx + 12, floorY - 58, 4)

    g.setDepth(depth + 0.5)
  }
}
