import 'src/api/font'
import { Canvas, CanvasRenderingContext2D, Image, loadImage } from 'skia-canvas'
import { resolve } from 'node:path'
import { getHexAsOpacity } from 'src/utils/opacity'
import { ASSETS_PATH } from 'src/constants'
import { getAccentColor } from 'src/utils/get-accent-color'
import sharp from 'sharp'
import { CardDetails } from 'src/lib/types'
import fetch from 'node-fetch'

const getAssetImage = (name: string) => resolve(ASSETS_PATH, `${name}.png`)

const CARD_PADDING = 8
const DEFAULT_BG_COLOR = '#363267'
const CARD_DETAIL_BLACK = '#000000'
const CARD_DETAIL_WHITE = '#ffffff'

const POWER_LEVEL_PAD_BOTTOM = 32
const POWER_LEVEL_CIRCLE_SIZE = 16
const POWER_LEVEL_CIRCLE_SPACING = 8
const POWER_LEVEL_CIRCLE_COUNT = 12
const POWER_LEVEL_CIRCLE_SUPER_THRESHOLD = 8
const SUPER_POWER_LEVEL_COLOR = '#FF8329'

const MAIN_TEXT_PADDING_BOTTOM = 72
const MAIN_TEXT_FADED_PADDING_BOTTOM = 83

type BaseStyles = {
  x?: number
  y?: number
  opacity?: number
  shadow?: {
    color: string
    blur: number
    opacity?: number
  }
}

type BoxStyles = BaseStyles & {
  bg: string | CanvasGradient
  width: number
  height: number
  radius?: [number, number, number, number]
}

type FontStyles = BaseStyles & {
  size: number
  color: string
  family: string
  weight?: number
  align?: CanvasTextAlign
  baseline?: CanvasTextBaseline
  tracking?: number
}

const textCreator =
  (ctx: CanvasRenderingContext2D) => (text: string, styles: FontStyles) => {
    ctx.font = `${styles.weight ?? 400} ${styles.size}px '${styles.family}'`
    ctx.fillStyle = getHexAsOpacity(styles.color, styles.opacity ?? 1)
    ctx.textAlign = styles.align ?? 'left'
    ctx.textBaseline = styles.baseline ?? 'alphabetic'
    ctx.textTracking = styles.tracking ?? 0
    if (styles.shadow) {
      ctx.shadowColor = getHexAsOpacity(
        styles.shadow.color,
        styles.shadow.opacity ?? 1,
      )
      ctx.shadowBlur = styles.shadow.blur
    }
    ctx.fillText(text, styles.x ?? 0, styles.y ?? 0)
  }

const boxCreator = (ctx: CanvasRenderingContext2D) => (styles: BoxStyles) => {
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

const imageFromUrl = (url: string) => fetch(url).then((res) => res.buffer())

export const createCard = async (details: CardDetails) => {
  const canvas = new Canvas(408, 608)
  const { width, height } = canvas
  const ctx = canvas.getContext('2d')

  const drawBox = boxCreator(ctx)
  const drawText = textCreator(ctx)

  const img = await loadImage(
    await sharp(
      await imageFromUrl(`https://cache.kado.gg/collections/${details.icon}`),
    )
      .png()
      .toBuffer(),
  )

  // this will be painted over, for colour picking purposes only
  ctx.beginPath()
  ctx.roundRect(0, 0, width, height, [12, 32, 12, 32])
  ctx.clip()
  ctx.drawImage(img, 0, 0, width, height)

  const colorAsHex = getAccentColor(ctx)

  drawBox({
    bg: colorAsHex,
    radius: [12, 32, 12, 32],
    height,
    width,
  })

  const shiny = await loadImage(getAssetImage('shiny'))
  if (details.isSuperShiny) {
    ctx.beginPath()
    ctx.roundRect(0, 0, width, height, [12, 32, 12, 32])
    ctx.clip()
    ctx.drawImage(shiny, 0, 0, width, height)
  }

  let overlayDetail: Image
  if (details.isDirty) {
    overlayDetail = await loadImage(getAssetImage('dirty'))
  } else {
    overlayDetail = await loadImage(getAssetImage('clean'))
  }

  ctx.beginPath()
  ctx.roundRect(0, 0, width, height, [12, 32, 12, 32])
  ctx.clip()
  ctx.filter = 'grayscale(100%) opacity(0.6)'
  ctx.drawImage(overlayDetail, 0, 0, width, height)
  ctx.filter = 'none'

  drawBox({
    bg: DEFAULT_BG_COLOR,
    radius: [4, 24, 4, 24],
    height: height - CARD_PADDING * 2,
    width: width - CARD_PADDING * 2,
    x: CARD_PADDING,
    y: CARD_PADDING,
  })

  ctx.beginPath()
  ctx.roundRect(
    CARD_PADDING,
    CARD_PADDING,
    width - CARD_PADDING * 2,
    height - CARD_PADDING * 2,
    [4, 24, 4, 24],
  )
  ctx.clip()

  const imageHeight = height
  const imageWidth = (img.width / img.height) * imageHeight

  const imageX = (width - imageWidth) / 2
  const imageY = 0

  ctx.drawImage(img, imageX, imageY, imageWidth, imageHeight)

  const pattern = await loadImage(getAssetImage('pattern'))

  ctx.beginPath()
  ctx.roundRect(0, 0, width, height, [12, 32, 12, 32])
  ctx.clip()
  ctx.globalCompositeOperation = 'multiply'
  ctx.drawImage(pattern, 0, 0, width, height)
  ctx.globalCompositeOperation = 'source-over'

  const gradient = ctx.createLinearGradient(0, 340, 0, height)

  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)')

  drawBox({
    bg: gradient,
    radius: [0, 0, 4, 24],
    height: 280,
    width: width - CARD_PADDING * 2,
    x: CARD_PADDING,
    y: height - 280 - CARD_PADDING,
  })

  const dCanvas = new Canvas(width, height)
  const dCtx = dCanvas.getContext('2d')

  const cardN = `#${details.currentPrintNumber}`
  dCtx.font = "500 28px 'Rubik'"
  dCtx.textTracking = 20
  const cardNWidth = dCtx.measureText(cardN).width
  const cardT = `/${details.totalPrintedCount}`
  dCtx.font = "600 20px 'Rubik'"
  dCtx.textTracking = 100
  const cardTWidth = dCtx.measureText(cardT).width

  drawBox({
    bg: colorAsHex,
    radius: [0, 0, 12, 0],
    height: 35,
    width: cardNWidth + cardTWidth + CARD_PADDING,
    x: CARD_PADDING,
    y: CARD_PADDING,
  })

  if (details.isSuperShiny) {
    dCtx.beginPath()
    dCtx.roundRect(
      CARD_PADDING,
      CARD_PADDING,
      cardNWidth + cardTWidth + CARD_PADDING,
      35,
      [0, 0, 12, 0],
    )
    dCtx.clip()
    dCtx.drawImage(shiny, 0, 0, width, height)
  }

  drawText(cardN, {
    color: CARD_DETAIL_BLACK,
    family: 'Rubik',
    size: 28,
    weight: 500,
    tracking: 20,
    align: 'left',
    baseline: 'bottom',
    x: CARD_PADDING,
    y: 35,
  })

  drawText(cardT, {
    color: CARD_DETAIL_BLACK,
    family: 'Rubik',
    size: 20,
    weight: 600,
    tracking: 100,
    align: 'left',
    baseline: 'bottom',
    x: CARD_PADDING + cardNWidth,
    y: 35,
  })

  drawText(details.name, {
    color: colorAsHex,
    family: 'Rubik',
    size: 48,
    weight: 600,
    tracking: 20,
    align: 'center',
    baseline: 'bottom',
    x: width / 2,
    y: height - MAIN_TEXT_PADDING_BOTTOM - CARD_PADDING,
    shadow: {
      color: colorAsHex,
      blur: 20,
      opacity: 0.4,
    },
  })

  ctx.beginPath()
  ctx.drawImage(dCanvas, 0, 0, width, height)
  if (details.isSuperShiny) {
    const olCanvas = new Canvas(width, height)
    const olCtx = olCanvas.getContext('2d')

    ctx.beginPath()
    olCtx.drawImage(shiny, 0, 0, width, height)

    olCtx.globalCompositeOperation = 'destination-atop'

    drawText('SHINY', {
      color: CARD_DETAIL_BLACK,
      family: 'Rubik',
      size: 28,
      weight: 600,
      tracking: 80,
      align: 'right',
      baseline: 'top',
      x: width - 20,
      y: 12,
    })

    olCtx.globalCompositeOperation = 'source-over'

    ctx.drawImage(olCanvas, 0, 0, width, height)
  }

  drawText(details.name, {
    family: 'Rubik',
    size: 48,
    weight: 600,
    color: colorAsHex,
    align: 'center',
    baseline: 'bottom',
    tracking: 20,
    shadow: details.isSuperShiny
      ? { color: colorAsHex, blur: 20, opacity: 0.4 }
      : undefined,
    x: width / 2,
    y: height - MAIN_TEXT_PADDING_BOTTOM - CARD_PADDING,
  })

  drawText(details.name, {
    family: 'Rubik',
    color: colorAsHex,
    opacity: 0.2,
    weight: 600,
    size: 64,
    tracking: 20,
    align: 'center',
    baseline: 'bottom',
    x: width / 2,
    y: height - MAIN_TEXT_FADED_PADDING_BOTTOM - CARD_PADDING,
  })

  const generatePowerCircle = (
    x: number,
    radius: number,
    isActive: boolean,
    isSuper: boolean,
  ) => {
    const color = isSuper ? SUPER_POWER_LEVEL_COLOR : colorAsHex
    ctx.beginPath()
    ctx.fillStyle = getHexAsOpacity(color, isActive ? 1 : 0.4)
    ctx.arc(
      x,
      height - POWER_LEVEL_PAD_BOTTOM - POWER_LEVEL_CIRCLE_SIZE,
      radius,
      0,
      Math.PI * 2,
    )

    ctx.shadowColor = getHexAsOpacity(color, 0.6)
    ctx.shadowBlur = 12

    ctx.fill()
  }

  const circleTotalWidth =
    POWER_LEVEL_CIRCLE_COUNT * POWER_LEVEL_CIRCLE_SIZE +
    (POWER_LEVEL_CIRCLE_COUNT - 1) * POWER_LEVEL_CIRCLE_SPACING
  const circleStartX = (width - circleTotalWidth) / 2 + CARD_PADDING

  for (let i = 0; i < POWER_LEVEL_CIRCLE_COUNT; i++) {
    generatePowerCircle(
      circleStartX + i * (POWER_LEVEL_CIRCLE_SIZE + POWER_LEVEL_CIRCLE_SPACING),
      POWER_LEVEL_CIRCLE_SIZE / 2,
      i < details.powerLevel,
      i > POWER_LEVEL_CIRCLE_SUPER_THRESHOLD,
    )
  }

  drawText(details.cin, {
    x: width / 2,
    y: height - CARD_PADDING - CARD_PADDING / 2,
    weight: 600,
    size: 11,
    family: 'Rubik',
    align: 'center',
    baseline: 'bottom',
    tracking: 120,
    color: CARD_DETAIL_WHITE,
    opacity: 0.15,
  })

  ctx.beginPath()
  ctx.roundRect(0, 0, width, height, [12, 32, 12, 32])
  ctx.clip()
  ctx.filter = 'grayscale(100%) opacity(0.6)'
  ctx.drawImage(overlayDetail, 0, 0, width, height)
  ctx.filter = 'none'

  const resizedCanvas = new Canvas(width / 2, height / 2)
  const resizedCtx = resizedCanvas.getContext('2d')
  resizedCtx.drawImage(canvas, 0, 0, width / 2, height / 2)

  return await resizedCanvas.toBuffer('png')
}
