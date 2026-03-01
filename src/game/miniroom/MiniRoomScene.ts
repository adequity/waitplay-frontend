import type { RoomData, RoomFurniture, FurnitureType, FurnitureSpec } from './RoomConfig'
import { FURNITURE_SPECS, WALL_THEMES, ISO_CONFIG, DEFAULT_ROOM } from './RoomConfig'
import { gridToIso, getDepthValue, hexToNumber } from './IsometricUtils'

const SPRITE_BASE = '/assets/miniroom/'

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
    if (!this.textures.exists('floorTile')) {
      this.load.image('floorTile', SPRITE_BASE + 'floorFull_SE.png')
    }

    // Furniture sprites
    const loaded = new Set<string>()
    for (const item of this.roomData.furniture) {
      const spec = FURNITURE_SPECS[item.type as FurnitureType]
      if (!spec || loaded.has(spec.sprite)) continue
      loaded.add(spec.sprite)
      this.load.image(spec.sprite, SPRITE_BASE + spec.sprite)
    }
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height

    this.originX = W / 2
    this.originY = H * 0.28

    this.drawBackground(W, H)
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

  private drawBackground(W: number, H: number) {
    const bg = this.add.graphics()
    const topColor = 0xF0EDE8
    const bottomColor = 0xE0D8D0
    for (let y = 0; y < H; y += 2) {
      const t = y / H
      const r = ((topColor >> 16) & 0xff) * (1 - t) + ((bottomColor >> 16) & 0xff) * t
      const g = ((topColor >> 8) & 0xff) * (1 - t) + ((bottomColor >> 8) & 0xff) * t
      const b = (topColor & 0xff) * (1 - t) + (bottomColor & 0xff) * t
      bg.fillStyle((Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b), 1)
      bg.fillRect(0, y, W, 2)
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
    wall.lineStyle(2, theme.wallStroke, 0.6)
    wall.lineBetween(
      this.originX + topLeft.x, this.originY + topLeft.y - wallHeight,
      this.originX + topRight.x, this.originY + topRight.y - wallHeight
    )
    wall.lineBetween(
      this.originX + topLeft.x, this.originY + topLeft.y - wallHeight,
      this.originX + bottomLeft.x, this.originY + bottomLeft.y - wallHeight
    )

    // Wall-floor junction lines
    wall.lineStyle(1, theme.wallStroke, 0.3)
    wall.lineBetween(
      this.originX + topLeft.x, this.originY + topLeft.y,
      this.originX + topRight.x, this.originY + topRight.y
    )
    wall.lineBetween(
      this.originX + topLeft.x, this.originY + topLeft.y,
      this.originX + bottomLeft.x, this.originY + bottomLeft.y
    )

    wall.setDepth(-10)
  }

  private drawFloor() {
    const { gridCols, gridRows, floorSpriteScale } = ISO_CONFIG

    for (let col = 0; col < gridCols; col++) {
      for (let row = 0; row < gridRows; row++) {
        const iso = gridToIso(col, row)
        const tile = this.add.image(
          this.originX + iso.x,
          this.originY + iso.y,
          'floorTile'
        )
        tile.setScale(floorSpriteScale)
        tile.setOrigin(0.5, 0)
        tile.setDepth(-5)

        // Subtle checkerboard tint
        if ((col + row) % 2 === 1) {
          tile.setTint(0xEEEEEE)
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
    shadow.fillEllipse(x, floorY, spec.widthTiles * 28, spec.heightTiles * 14)
    shadow.setDepth(depth - 0.1)

    // Sprite image - origin at bottom-center, sitting on the floor
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
    g.fillEllipse(cx, floorY + 2, 24, 12)

    if (char.shape === 'circle') {
      g.fillStyle(color, 1)
      g.fillCircle(cx, floorY - 22, 12)
      g.fillStyle(color, 0.85)
      g.fillRoundedRect(cx - 8, floorY - 12, 16, 12, 4)
    } else {
      g.fillStyle(color, 1)
      g.fillRoundedRect(cx - 10, floorY - 30, 20, 28, 6)
    }

    // Eyes
    g.fillStyle(0xFFFFFF, 1)
    g.fillCircle(cx - 4, floorY - 24, 2.5)
    g.fillCircle(cx + 4, floorY - 24, 2.5)
    g.fillStyle(0x333333, 1)
    g.fillCircle(cx - 3.5, floorY - 23.5, 1.5)
    g.fillCircle(cx + 4.5, floorY - 23.5, 1.5)

    g.setDepth(depth + 0.5)
  }
}
