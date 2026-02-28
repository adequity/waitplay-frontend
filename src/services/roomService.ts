import api from './api'

export interface FurnitureItem {
  itemId: string
  type: string
  gridX: number
  gridY: number
  rotation: number
  scale: number
  color?: string
}

export interface CharacterStyle {
  color: string
  shape: string
  accessory?: string
}

export interface RoomConfiguration {
  userId: string
  wallTheme: string
  floorTheme: string
  furniture: FurnitureItem[]
  character: CharacterStyle
}

export async function getRoomConfiguration(profileCode: string): Promise<RoomConfiguration> {
  const response = await api.get(`/api/room/${profileCode}`)
  return response.data
}

export async function updateRoomConfiguration(
  data: Partial<Omit<RoomConfiguration, 'userId'>>
): Promise<RoomConfiguration> {
  const response = await api.put('/api/room', data)
  return response.data
}

export default { getRoomConfiguration, updateRoomConfiguration }
