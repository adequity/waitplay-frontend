import type * as PhaserTypes from 'phaser'
import type { VillageStoreRoom, VillageEmptySlot } from './VillageConfig'
import { getThemeBgColorCss } from './VillageConfig'

export class MiniRoomManager {
  private game: PhaserTypes.Game | null = null
  private Phaser: typeof PhaserTypes | null = null

  public async init(
    containerId: string,
    roomData?: Record<string, unknown>,
    villageRooms?: VillageStoreRoom[],
    emptySlots?: VillageEmptySlot[],
    selectedRoomAssetUrl?: string,
    villageTheme?: string,
  ): Promise<PhaserTypes.Game> {
    if (this.game) {
      this.destroy()
    }

    if (!this.Phaser) {
      this.Phaser = await import('phaser')
    }

    const { MiniRoomScene } = await import('./MiniRoomScene')

    const sceneInstance = new MiniRoomScene()
    if (roomData) {
      (sceneInstance as any)._initialRoomData = roomData
    }
    if (villageRooms && villageRooms.length > 0) {
      (sceneInstance as any)._initialVillageRooms = villageRooms
    }
    if (emptySlots && emptySlots.length > 0) {
      (sceneInstance as any)._initialEmptySlots = emptySlots
    }
    if (selectedRoomAssetUrl) {
      (sceneInstance as any)._initialSelectedRoomAssetUrl = selectedRoomAssetUrl
    }
    if (villageTheme) {
      (sceneInstance as any)._initialVillageTheme = villageTheme
    }

    // Convert theme to hex color string for Phaser game config
    const themeColor = villageTheme ? getThemeBgColorCss(villageTheme) : '#FFFFFF'

    const config: PhaserTypes.Types.Core.GameConfig = {
      type: this.Phaser.AUTO,
      parent: containerId,
      backgroundColor: themeColor,
      scene: sceneInstance,
      scale: {
        mode: this.Phaser.Scale.RESIZE,
        autoCenter: this.Phaser.Scale.CENTER_BOTH,
        parent: containerId,
        width: '100%',
        height: '100%',
      },
      input: {
        touch: { capture: true },
        activePointers: 3,
      },
      render: {
        antialias: true,
        pixelArt: false,
        roundPixels: true,
      },
    }

    this.game = new this.Phaser.Game(config)

    const container = document.getElementById(containerId)
    const canvas = container?.querySelector('canvas')
    if (canvas) {
      canvas.style.touchAction = 'none'
    }

    return this.game
  }

  public updateRoomData(roomData: Record<string, unknown>): void {
    window.dispatchEvent(
      new CustomEvent('miniroom-update', { detail: { roomData } })
    )
  }

  /** Reload village by restarting the scene — preserves WebGL context and texture cache */
  public reloadVillage(
    roomData: Record<string, unknown>,
    villageRooms: VillageStoreRoom[],
    emptySlots: VillageEmptySlot[],
    selectedRoomAssetUrl?: string,
    villageTheme?: string,
  ): void {
    if (!this.game) return
    const scene = this.game.scene.getScene('MiniRoomScene')
    if (scene) {
      scene.scene.restart({
        roomData,
        villageRooms,
        emptySlots,
        selectedRoomAssetUrl,
        villageTheme,
      })
    }
  }

  public destroy(): void {
    if (this.game) {
      this.game.destroy(true)
      this.game = null
    }
  }
}

export const miniRoomManager = new MiniRoomManager()
