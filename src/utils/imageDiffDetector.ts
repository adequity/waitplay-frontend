/**
 * 이미지 차이점 자동 감지 유틸리티
 * 두 이미지를 픽셀 단위로 비교하여 차이점 영역을 찾습니다.
 */

export interface DifferencePoint {
  x: number      // 0~1 비율값
  y: number      // 0~1 비율값
  radius: number // 0~1 비율값
}

interface PixelGroup {
  pixels: { x: number; y: number }[]
  minX: number
  maxX: number
  minY: number
  maxY: number
}

/**
 * 두 이미지의 차이점을 자동으로 감지합니다.
 * @param originalImageUrl 원본 이미지 URL 또는 Data URL
 * @param modifiedImageUrl 수정된 이미지 URL 또는 Data URL
 * @param options 감지 옵션
 * @returns 차이점 좌표 배열
 */
export async function detectDifferences(
  originalImageUrl: string,
  modifiedImageUrl: string,
  options: {
    threshold?: number      // 픽셀 차이 임계값 (0-255, 기본 30)
    minGroupSize?: number   // 최소 그룹 크기 (픽셀 수, 기본 100)
    maxDifferences?: number // 최대 차이점 개수 (기본 10)
    radiusPadding?: number  // 반경 패딩 비율 (기본 1.5)
  } = {}
): Promise<DifferencePoint[]> {
  const {
    threshold = 30,
    minGroupSize = 100,
    maxDifferences = 10,
    radiusPadding = 1.5
  } = options

  // 이미지 로드
  const [originalImg, modifiedImg] = await Promise.all([
    loadImage(originalImageUrl),
    loadImage(modifiedImageUrl)
  ])

  // 캔버스 생성 및 이미지 그리기
  const width = Math.min(originalImg.width, modifiedImg.width)
  const height = Math.min(originalImg.height, modifiedImg.height)

  const canvas1 = document.createElement('canvas')
  const canvas2 = document.createElement('canvas')
  canvas1.width = width
  canvas1.height = height
  canvas2.width = width
  canvas2.height = height

  const ctx1 = canvas1.getContext('2d')!
  const ctx2 = canvas2.getContext('2d')!

  ctx1.drawImage(originalImg, 0, 0, width, height)
  ctx2.drawImage(modifiedImg, 0, 0, width, height)

  // 픽셀 데이터 가져오기
  const data1 = ctx1.getImageData(0, 0, width, height).data
  const data2 = ctx2.getImageData(0, 0, width, height).data

  // 차이가 있는 픽셀 찾기
  const diffPixels: { x: number; y: number }[] = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4

      const rDiff = Math.abs((data1[i] ?? 0) - (data2[i] ?? 0))
      const gDiff = Math.abs((data1[i + 1] ?? 0) - (data2[i + 1] ?? 0))
      const bDiff = Math.abs((data1[i + 2] ?? 0) - (data2[i + 2] ?? 0))

      const avgDiff = (rDiff + gDiff + bDiff) / 3

      if (avgDiff > threshold) {
        diffPixels.push({ x, y })
      }
    }
  }

  console.log(`[ImageDiff] Found ${diffPixels.length} different pixels`)

  if (diffPixels.length === 0) {
    return []
  }

  // 인접 픽셀들을 그룹화
  const groups = groupAdjacentPixels(diffPixels, width, height)
  console.log(`[ImageDiff] Grouped into ${groups.length} regions`)

  // 최소 크기 이상인 그룹만 필터링
  const significantGroups = groups
    .filter(g => g.pixels.length >= minGroupSize)
    .sort((a, b) => b.pixels.length - a.pixels.length)
    .slice(0, maxDifferences)

  console.log(`[ImageDiff] ${significantGroups.length} significant regions found`)

  // 그룹을 DifferencePoint로 변환
  const differences: DifferencePoint[] = significantGroups.map(group => {
    const centerX = (group.minX + group.maxX) / 2
    const centerY = (group.minY + group.maxY) / 2

    const groupWidth = group.maxX - group.minX
    const groupHeight = group.maxY - group.minY
    const radius = Math.max(groupWidth, groupHeight) / 2 * radiusPadding

    return {
      x: centerX / width,
      y: centerY / height,
      radius: radius / Math.max(width, height)
    }
  })

  return differences
}

/**
 * 이미지를 로드합니다.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * 인접한 픽셀들을 그룹화합니다 (Flood Fill 알고리즘)
 */
function groupAdjacentPixels(
  pixels: { x: number; y: number }[],
  width: number,
  height: number
): PixelGroup[] {
  // 빠른 조회를 위한 Set 생성
  const pixelSet = new Set<string>()
  pixels.forEach(p => pixelSet.add(`${p.x},${p.y}`))

  const visited = new Set<string>()
  const groups: PixelGroup[] = []

  // 8방향 이웃 (상하좌우 + 대각선)
  const neighbors = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],          [1, 0],
    [-1, 1],  [0, 1],  [1, 1]
  ]

  for (const pixel of pixels) {
    const key = `${pixel.x},${pixel.y}`
    if (visited.has(key)) continue

    // BFS로 연결된 픽셀 그룹 찾기
    const group: PixelGroup = {
      pixels: [],
      minX: pixel.x,
      maxX: pixel.x,
      minY: pixel.y,
      maxY: pixel.y
    }

    const queue = [pixel]
    visited.add(key)

    while (queue.length > 0) {
      const current = queue.shift()!
      group.pixels.push(current)

      group.minX = Math.min(group.minX, current.x)
      group.maxX = Math.max(group.maxX, current.x)
      group.minY = Math.min(group.minY, current.y)
      group.maxY = Math.max(group.maxY, current.y)

      // 이웃 픽셀 확인
      for (const neighbor of neighbors) {
        const dx = neighbor[0] as number
        const dy = neighbor[1] as number
        const nx = current.x + dx
        const ny = current.y + dy
        const nKey = `${nx},${ny}`

        if (nx >= 0 && nx < width && ny >= 0 && ny < height &&
            pixelSet.has(nKey) && !visited.has(nKey)) {
          visited.add(nKey)
          queue.push({ x: nx, y: ny })
        }
      }
    }

    groups.push(group)
  }

  return groups
}
