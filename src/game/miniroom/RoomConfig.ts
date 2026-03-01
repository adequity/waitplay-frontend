export interface RoomFurniture {
  itemId: string
  type: FurnitureType
  gridX: number
  gridY: number
  rotation: number
  scale: number
  color: string
}

export type FurnitureType = 'sofa' | 'table' | 'lamp' | 'plant' | 'bookshelf' | 'rug'

export interface RoomCharacter {
  color: string
  shape: 'circle' | 'square'
  accessory?: string
}

export interface RoomData {
  wallTheme: string
  floorTheme: string
  furniture: RoomFurniture[]
  character: RoomCharacter
}

export interface FurnitureSpec {
  widthTiles: number
  heightTiles: number
  elevationTiles: number
  label: string
  sprite: string
  displayScale: number
}

export const FURNITURE_SPECS: Record<FurnitureType, FurnitureSpec> = {
  sofa:      { widthTiles: 2, heightTiles: 1, elevationTiles: 0.6, label: '소파', sprite: 'loungeSofa_SE.png', displayScale: 0.5 },
  table:     { widthTiles: 1.5, heightTiles: 1, elevationTiles: 0.5, label: '테이블', sprite: 'tableCoffee_SE.png', displayScale: 0.45 },
  lamp:      { widthTiles: 0.5, heightTiles: 0.5, elevationTiles: 1.2, label: '조명', sprite: 'lampRoundFloor_SE.png', displayScale: 0.45 },
  plant:     { widthTiles: 0.7, heightTiles: 0.7, elevationTiles: 0.8, label: '식물', sprite: 'pottedPlant_SE.png', displayScale: 0.5 },
  bookshelf: { widthTiles: 1.5, heightTiles: 0.5, elevationTiles: 1.5, label: '책장', sprite: 'bookcaseOpen_SE.png', displayScale: 0.45 },
  rug:       { widthTiles: 2, heightTiles: 2, elevationTiles: 0, label: '러그', sprite: 'rugRound_SE.png', displayScale: 0.45 },
}

export const WALL_THEMES: Record<string, { wallColor: number; wallStroke: number }> = {
  default: { wallColor: 0xE8E0D8, wallStroke: 0xD0C8C0 },
  wood:    { wallColor: 0xDEB887, wallStroke: 0xC8A870 },
  brick:   { wallColor: 0xCB8068, wallStroke: 0xB06050 },
}

export const FLOOR_THEMES: Record<string, { floorColor: number; floorStroke: number }> = {
  default: { floorColor: 0xC8B8A8, floorStroke: 0xB8A898 },
  carpet:  { floorColor: 0x9B8EC4, floorStroke: 0x8B7EB4 },
  tile:    { floorColor: 0xA8C8D8, floorStroke: 0x98B8C8 },
}

export const ISO_CONFIG = {
  tileWidth: 80,
  tileHeight: 56,
  gridCols: 6,
  gridRows: 6,
  wallHeight: 200,
  floorSpriteScale: 80 / 208,
}

export const DEFAULT_ROOM: RoomData = {
  wallTheme: 'default',
  floorTheme: 'default',
  furniture: [
    { itemId: 'sofa-1', type: 'sofa', gridX: 1, gridY: 3, rotation: 0, scale: 1, color: '#667eea' },
    { itemId: 'table-1', type: 'table', gridX: 3, gridY: 2, rotation: 0, scale: 1, color: '#764ba2' },
    { itemId: 'lamp-1', type: 'lamp', gridX: 0, gridY: 0, rotation: 0, scale: 1, color: '#fbbf24' },
    { itemId: 'plant-1', type: 'plant', gridX: 5, gridY: 1, rotation: 0, scale: 1, color: '#10b981' },
    { itemId: 'bookshelf-1', type: 'bookshelf', gridX: 2, gridY: 0, rotation: 0, scale: 1, color: '#8b5cf6' },
    { itemId: 'rug-1', type: 'rug', gridX: 3, gridY: 3, rotation: 0, scale: 1, color: '#f472b6' },
  ],
  character: { color: '#667eea', shape: 'circle' },
}
