import { Canvas, CanvasGradient, loadImage } from 'skia-canvas'
import { resolve } from 'node:path'
import { ASSETS_PATH } from 'src/constants'
import { getAccentColor } from 'src/utils/get-accent-color'
import sharp from 'sharp'
import fetch from 'node-fetch'
import { boxCreator, textCreator } from 'src/utils/canvas'
import { getAssetImage } from 'src/utils/assets'

const imageFromUrl = (url: string) => fetch(url).then((res) => res.buffer())

export interface WelcomeImageDetails {
  avatarUrl?: string
  username: string
  discriminator: string
}

const scale = 2

export const createWelcomeImage = async (details: WelcomeImageDetails) => {
  const baseImage = await loadImage(getAssetImage('welcome', 'base-0'))

  const canvas = new Canvas(baseImage.width * scale, baseImage.height * scale)

  const { width, height } = canvas

  const ctx = canvas.getContext('2d')

  ctx.drawImage(baseImage, 0, 0, width, height)

  const drawBox = boxCreator(ctx)
  const drawText = textCreator(ctx)

  const avatarImage = details.avatarUrl
    ? await loadImage(
        await sharp(await imageFromUrl(details.avatarUrl))
          .png()
          .toBuffer(),
      )
    : null

  const avatarCanvas = new Canvas(width, height)
  const avatarCtx = avatarCanvas.getContext('2d')

  if (avatarImage) {
    ctx.fillStyle = '#ffffff'

    ctx.strokeStyle = ctx.fillStyle

    ctx.shadowColor = '#000000'
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.shadowBlur = 12 * scale

    ctx.arc(
      (232 + 42) * scale,
      (12 + 42) * scale,
      (42 + 4) * scale,
      0,
      2 * Math.PI,
      false,
    )

    ctx.fill()

    ctx.shadowColor = 'transparent'

    avatarCtx.beginPath()
    avatarCtx.arc(
      (232 + 42) * scale,
      (12 + 42) * scale,
      42 * scale,
      0,
      2 * Math.PI,
      false,
    )
    avatarCtx.closePath()
    avatarCtx.clip()
    avatarCtx.drawImage(
      avatarImage,
      232 * scale,
      12 * scale,
      84 * scale,
      84 * scale,
    )

    ctx.drawCanvas(avatarCanvas, 0, 0, width, height)
  }

  const avatarAccentCanvas = new Canvas(84 * scale, 84 * scale)
  const avatarAccentCtx = avatarAccentCanvas.getContext('2d')

  let gradientStop = '#edc8cc'

  if (avatarImage) {
    avatarAccentCtx.drawImage(
      avatarImage,
      0,
      0,
      avatarAccentCanvas.width,
      avatarAccentCanvas.height,
    )

    gradientStop = getAccentColor(avatarAccentCtx, '#edc8cc')
  }

  const gradient = ctx.createLinearGradient(0, 0, width, height)

  gradient.addColorStop(0.5, '#ffffff')
  gradient.addColorStop(1, gradientStop)

  drawText('Welcome to Gatchi', {
    family: 'Pangolin',
    gradient,
    align: 'center',
    size: 48,
    baseline: 'middle',
    x: 274 * scale,
    y: 128 * scale,
    border: {
      color: '#000000',
      width: 4 * scale,
    },
    shadow: {
      color: '#000000',
      blur: 12 * scale,
      opacity: 0.8,
    },
  })

  drawText(`${details.username}#${details.discriminator}`, {
    family: 'Pangolin',
    gradient,
    align: 'center',
    size: 48,
    baseline: 'middle',
    x: 274 * scale,
    y: 162 * scale,
    border: {
      color: '#000000',
      width: 4 * scale,
    },
    shadow: {
      color: '#000000',
      blur: 12 * scale,
      opacity: 0.8,
    },
  })

  return await canvas.toBuffer('png')
}
