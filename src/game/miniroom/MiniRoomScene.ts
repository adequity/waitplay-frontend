import type { RoomData, RoomFurniture, FurnitureType, FurnitureSpec } from './RoomConfig'
import { FURNITURE_SPECS, WALL_THEMES, FLOOR_THEMES, ISO_CONFIG, DEFAULT_ROOM } from './RoomConfig'
import { gridToIso, getDepthValue, hexToNumber, drawIsoDiamond } from './IsometricUtils'

const SPRITE_BASE = '/assets/miniroom/custom/'

export class MiniRoomScene extends Phaser.Scene {
  private roomData: RoomData = DEFAULT_ROOM
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
    // Floor tile
    if (!this.textures.exists('custom_floor')) {
      this.load.image('custom_floor', SPRITE_BASE + 'floor_tile.png')
    }

    // Furniture sprites
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
    const { gridCols, gridRows, tileWidth, tileHeight, wallHeight } = ISO_CONFIG

    // World-space origin at (0, 0), everything relative to this
    this.originX = 0
    this.originY = 0

    // Calculate world bounds
    const topLeft = gridToIso(0, 0)
    const topRight = gridToIso(gridCols, 0)
    const bottomLeft = gridToIso(0, gridRows)
    const bottomRight = gridToIso(gridCols, gridRows)

    const worldLeft = bottomLeft.x - 20
    const worldRight = topRight.x + 20
    const worldTop = topLeft.y - wallHeight - 20
    const worldBottom = bottomRight.y + tileHeight / 2 + 20
    const worldWidth = worldRight - worldLeft
    const worldHeight = worldBottom - worldTop

    // Camera zoom to fit
    const W = this.scale.width
    const H = this.scale.height
    const zoom = Math.min(W / worldWidth, H / worldHeight) * 0.92
    const centerX = (worldLeft + worldRight) / 2
    const centerY = (worldTop + worldBottom) / 2

    this.cameras.main.setZoom(zoom)
    this.cameras.main.centerOn(centerX, centerY)

    this.drawBackground(centerX, centerY, worldWidth, worldHeight)
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

  private drawBackground(cx: number, cy: number, ww: number, wh: number) {
    const bg = this.add.graphics()
    const size = Math.max(ww, wh) * 3
    const topColor = 0xF0EDE8
    const bottomColor = 0xE0D8D0
    const steps = 30
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
    const ox = this.originX
    const oy = this.originY

    const topLeft = gridToIso(0, 0)
    const topRight = gridToIso(gridCols, 0)
    const bottomLeft = gridToIso(0, gridRows)

    // Back wall
    wall.fillStyle(theme.wallColor, 1)
    wall.beginPath()
    wall.moveTo(ox + topLeft.x, oy + topLeft.y)
    wall.lineTo(ox + topRight.x, oy + topRight.y)
    wall.lineTo(ox + topRight.x, oy + topRight.y - wallHeight)
    wall.lineTo(ox + topLeft.x, oy + topLeft.y - wallHeight)
    wall.closePath()
    wall.fillPath()

    // Left wall
    const leftWallColor = (theme.wallColor & 0xFEFEFE) >> 1
    wall.fillStyle(leftWallColor | (theme.wallColor & 0x010101), 0.9)
    wall.beginPath()
    wall.moveTo(ox + topLeft.x, oy + topLeft.y)
    wall.lineTo(ox + bottomLeft.x, oy + bottomLeft.y)
    wall.lineTo(ox + bottomLeft.x, oy + bottomLeft.y - wallHeight)
    wall.lineTo(ox + topLeft.x, oy + topLeft.y - wallHeight)
    wall.closePath()
    wall.fillPath()

    // Edge lines
    wall.lineStyle(3, theme.wallStroke, 0.6)
    wall.lineBetween(
      ox + topLeft.x, oy + topLeft.y - wallHeight,
      ox + topRight.x, oy + topRight.y - wallHeight
    )
    wall.lineBetween(
      ox + topLeft.x, oy + topLeft.y - wallHeight,
      ox + bottomLeft.x, oy + bottomLeft.y - wallHeight
    )

    wall.setDepth(-10)
  }

  private drawFloor() {
    const theme = (FLOOR_THEMES[this.roomData.floorTheme] ?? FLOOR_THEMES['default'])!
    const { tileWidth, tileHeight, gridCols, gridRows } = ISO_CONFIG

    // Use custom floor tile sprite
    for (let col = 0; col < gridCols; col++) {
      for (let row = 0; row < gridRows; row++) {
        const iso = gridToIso(col, row)
        const cx = this.originX + iso.x
        const cy = this.originY + iso.y + tileHeight / 2  // center of diamond

        const tile = this.add.image(cx, cy, 'custom_floor')
        // floor_tile.png is 130x66, diamond is 128x64 centered with 1px padding
        tile.setOrigin(0.5, 0.5)
        tile.setDepth(-5)

        if ((col + row) % 2 === 1) {
          tile.setTint(0xF2EEEA)
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
    shadow.fillEllipse(x, floorY, spec.widthTiles * 50, spec.heightTiles * 25)
    shadow.setDepth(depth - 0.1)

    // Sprite
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
    g.fillEllipse(cx, floorY + 3, 40, 20)

    if (char.shape === 'circle') {
      g.fillStyle(color, 1)
      g.fillCircle(cx, floorY - 40, 20)
      g.fillStyle(color, 0.85)
      g.fillRoundedRect(cx - 14, floorY - 22, 28, 22, 6)
    } else {
      g.fillStyle(color, 1)
      g.fillRoundedRect(cx - 16, floorY - 55, 32, 50, 10)
    }

    // Eyes
    g.fillStyle(0xFFFFFF, 1)
    g.fillCircle(cx - 7, floorY - 44, 4)
    g.fillCircle(cx + 7, floorY - 44, 4)
    g.fillStyle(0x333333, 1)
    g.fillCircle(cx - 5.5, floorY - 43, 2.5)
    g.fillCircle(cx + 8.5, floorY - 43, 2.5)

    g.setDepth(depth + 0.5)
  }
}
