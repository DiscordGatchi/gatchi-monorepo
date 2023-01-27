import { CanvasRenderingContext2D } from 'skia-canvas'

export const getAccentColor = (
  ctx: CanvasRenderingContext2D,
  lowerRestrictions = false,
): string => {
  const { width, height } = ctx.canvas

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const pixelCount = data.length / 4
  const colorAccumulator = new Map<string, number>()

  for (let i = 0; i < pixelCount; i++) {
    const color = `#${data[i * 4].toString(16)}${data[i * 4 + 1].toString(
      16,
    )}${data[i * 4 + 2].toString(16)}`

    colorAccumulator.set(color, (colorAccumulator.get(color) ?? 0) + 1)
  }

  for (const [color] of colorAccumulator) {
    if (
      parseInt(color.slice(1), 16) < (lowerRestrictions ? 0x1f1f1f : 0x7f7f7f)
    ) {
      colorAccumulator.delete(color)
    }
  }

  for (const [color] of colorAccumulator) {
    if (getSaturation(color) < (lowerRestrictions ? 0.1 : 0.5)) {
      colorAccumulator.delete(color)
    }
  }

  const sortedColors = [...colorAccumulator.entries()].sort(
    (a, b) => b[1] - a[1],
  )

  const result = sortedColors?.[0]?.[0]

  return result ? result : getAccentColor(ctx, true)
}

const getSaturation = (color: string) => {
  const rgb = hexToRgb(color)
  const max = Math.max(rgb.r, rgb.g, rgb.b)
  const min = Math.min(rgb.r, rgb.g, rgb.b)
  return (max - min) / max
}

const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}
