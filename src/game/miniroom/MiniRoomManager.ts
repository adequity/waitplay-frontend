import type * as PhaserTypes from 'phaser'

export class MiniRoomManager {
  private game: PhaserTypes.Game | null = null
  private Phaser: typeof PhaserTypes | null = null

  public async init(
    containerId: string,
    roomData?: Record<string, unknown>
  ): Promise<PhaserTypes.Game> {
    if (this.game) {
      this.destroy()
    }

    if (!this.Phaser) {
      this.Phaser = await import('phaser')
    }

    const { MiniRoomScene } = await import('./MiniRoomScene')

    // Create scene instance with roomData so it's available on first boot
    // (avoids unnecessary scene.restart which causes double init)
    const sceneInstance = new MiniRoomScene()
    if (roomData) {
      (sceneInstance as any)._initialRoomData = roomData
    }

    const config: PhaserTypes.Types.Core.GameConfig = {
      type: this.Phaser.AUTO,
      parent: containerId,
      backgroundColor: '#F0EDE8',
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

    // Phaser canvas must have touch-action: none directly set
    // (CSS scoped styles can't reach dynamically created canvas)
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

  public destroy(): void {
    if (this.game) {
      this.game.destroy(true)
      this.game = null
    }
  }
}

export const miniRoomManager = new MiniRoomManager()
