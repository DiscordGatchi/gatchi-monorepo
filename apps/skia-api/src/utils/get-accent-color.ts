import { CanvasRenderingContext2D } from 'skia-canvas'

interface AccentColorOptions {
  minFrequency: number
  closestColorThreshold: number
  minBrightness: number
  minSaturation: number
  minLuminance: number
}

const defaultAccentColorOptions = {
  minFrequency: 1,
  closestColorThreshold: 0x010101,
  minBrightness: 0.8,
  minSaturation: 0.5,
  minLuminance: 0.5,
} satisfies AccentColorOptions

export const getAccentColor = (
  ctx: CanvasRenderingContext2D,
  fallbackColor = '#ff0000',
  options: AccentColorOptions = defaultAccentColorOptions,
): string => {
  const { width, height } = ctx.canvas

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const pixelCount = data.length / 4
  const colorAccumulator = new Map<string, number>()

  const getColorsNear = (color: string) => {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)

    const colors = []

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        for (let k = -1; k <= 1; k++) {
          const newColor = `#${(r + i).toString(16)}${(g + j)
            .toString(16)
            .padStart(2, '0')}${(b + k).toString(16).padStart(2, '0')}`

          colors.push(newColor)
        }
      }
    }

    return colors
  }

  for (let i = 0; i < pixelCount; i++) {
    const color = `#${data[i * 4].toString(16)}${data[i * 4 + 1]
      .toString(16)
      .padStart(2, '0')}${data[i * 4 + 2].toString(16).padStart(2, '0')}`

    if (color.startsWith('#00')) continue

    colorAccumulator.set(color, (getColorsNear(color).length ?? 0) + 1)
  }

  const getBrightness = (color: string) => {
    const r = parseInt(color.slice(1, 3), 16) / 255
    const g = parseInt(color.slice(3, 5), 16) / 255
    const b = parseInt(color.slice(5, 7), 16) / 255

    return Math.max(r, g, b)
  }

  for (const [color] of colorAccumulator) {
    if (getBrightness(color) < options.minBrightness) {
      colorAccumulator.delete(color)
    } else if (getSaturation(color) < options.minSaturation) {
      colorAccumulator.delete(color)
    } else if (getLuminance(color) < options.minLuminance) {
      colorAccumulator.delete(color)
    }
  }

  for (const [color, frequency] of colorAccumulator) {
    if (frequency < options.minFrequency) {
      colorAccumulator.delete(color)
    }

    for (const [otherColor] of colorAccumulator) {
      if (color === otherColor) continue
      if (
        Math.abs(
          parseInt(color.slice(1), 16) - parseInt(otherColor.slice(1), 16),
        ) < options.closestColorThreshold
      ) {
        colorAccumulator.delete(otherColor)
      }
    }
  }

  const sortedColors = [...colorAccumulator.entries()].sort(
    (a, b) => b[1] - a[1],
  )

  const result = sortedColors[0]?.[0]

  return result ? result : fallbackColor
}

const getSaturation = (color: string) => {
  const rgb = hexToRgb(color)
  const max = Math.max(rgb.r, rgb.g, rgb.b)
  const min = Math.min(rgb.r, rgb.g, rgb.b)
  return (max - min) / max
}

const getLuminance = (color: string) => {
  const rgb = hexToRgb(color)
  return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255
}

const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}
