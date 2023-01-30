import { CanvasGradient, CanvasRenderingContext2D } from 'skia-canvas'
import { getHexAsOpacity } from 'src/utils/opacity'

export type BaseStyles = {
  x?: number
  y?: number
  opacity?: number
  shadow?: {
    color: string
    blur: number
    opacity?: number
  }
}

export type BoxStyles = BaseStyles & {
  bg: string | CanvasGradient
  width: number
  height: number
  radius?: [number, number, number, number]
}

export type FontStyles = BaseStyles & {
  size: number
  color?: string
  family: string
  weight?: number
  align?: CanvasTextAlign
  baseline?: CanvasTextBaseline
  tracking?: number
  gradient?: CanvasGradient
  border?: {
    color: string
    width: number
  }
}

export const textCreator =
  (ctx: CanvasRenderingContext2D) => (text: string, styles: FontStyles) => {
    ctx.font = `${styles.weight ?? 400} ${styles.size}px '${styles.family}'`
    ctx.fillStyle =
      styles.gradient ??
      getHexAsOpacity(styles.color ?? '#ffffff', styles.opacity ?? 1)
    ctx.textAlign = styles.align ?? 'left'
    ctx.textBaseline = styles.baseline ?? 'alphabetic'
    ctx.textTracking = styles.tracking ?? 0
    if (styles.shadow) {
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      ctx.shadowColor = getHexAsOpacity(
        styles.shadow.color,
        styles.shadow.opacity ?? 1,
      )
      ctx.shadowBlur = styles.shadow.blur
    }
    if (styles.border) {
      ctx.strokeStyle = styles.border.color
      ctx.lineWidth = styles.border.width
      ctx.lineCap = 'round'
      ctx.lineDashFit = 'turn'
      ctx.lineJoin = 'round'
      ctx.strokeText(text, styles.x ?? 0, styles.y ?? 0)
    }
    ctx.fillText(text, styles.x ?? 0, styles.y ?? 0)

    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.textTracking = 0
    ctx.lineWidth = 0
    ctx.strokeStyle = 'transparent'
    ctx.fillStyle = 'transparent'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.font = '10px sans-serif'
    ctx.closePath()
  }

export const boxCreator =
  (ctx: CanvasRenderingContext2D) => (styles: BoxStyles) => {
    ctx.beginPath()
    ctx.fillStyle =
      typeof styles.bg === 'string'
        ? getHexAsOpacity(styles.bg, styles.opacity ?? 1)
        : styles.bg
    if (styles.radius) {
      ctx.roundRect(
        styles.x ?? 0,
        styles.y ?? 0,
        styles.width,
        styles.height,
        styles.radius,
      )
    } else {
      ctx.rect(styles.x ?? 0, styles.y ?? 0, styles.width, styles.height)
    }
    ctx.fill()
  }
