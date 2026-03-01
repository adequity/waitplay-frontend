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

    const config: PhaserTypes.Types.Core.GameConfig = {
      type: this.Phaser.AUTO,
      parent: containerId,
      backgroundColor: '#F0EDE8',
      scene: MiniRoomScene,
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

    if (roomData) {
      this.game.events.once('ready', () => {
        const scene = this.game?.scene.getScene('MiniRoomScene')
        if (scene) {
          scene.scene.restart({ roomData })
        }
      })
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
