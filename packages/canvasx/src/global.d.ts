import { canvasx } from 'src/shim'

type JSXFactory = typeof canvasx

type CanvasxElement = {
  type: string
  attributes: Record<string, unknown>
  children: CanvasxNode[]
}

type CanvasxNode = CanvasxElement | string | null | number | boolean | undefined

type VersionNumber =
  | `${number}`
  | `${number}.${number}`
  | `${number}.${number}.${number}`

type Version = VersionNumber | `${VersionNumber}-${string}`

type OptionalComma = ', ' | ',' | ' '

type MaybePercent = `${number}%` | `${number}` | number

type RGBAlphaOrBlue =
  | number
  | `${number} / ${number}${'%' | ''}`
  | `${number}${OptionalComma}${number}`

type RGBADef =
  | `${
      | 'rgb'
      | 'rgba'}(${number}${OptionalComma}${number}${OptionalComma}${RGBAlphaOrBlue})`

type ColorProp =
  | 'transparent'
  | number
  | RGBADef
  | `${`${'https' | 'http'}://` | 'file:'}${string}`
  | `hsl(${number}${OptionalComma}${number}${OptionalComma}${number})`
  | `hsla(${number}${OptionalComma}${number}${OptionalComma}${number}${OptionalComma}${MaybePercent})`
  | `#${string}`
  | `#${string}${OptionalComma}${MaybePercent}`

type GradientDirection =
  | 'to-r'
  | 'to-l'
  | 'to-t'
  | 'to-b'
  | 'to-tr'
  | 'to-tl'
  | 'to-br'
  | 'to-bl'

type BackgroundColorProp =
  | ColorProp
  | `linear(${GradientDirection}${OptionalComma}${string})`
  | `radial(${string})`

type SizeProp =
  | number
  | 'full'
  | 'half'
  | `${number}`
  | `${number}px`
  | `${number}%`
  | undefined

type RadiusProp =
  | SizeProp
  | `${SizeProp} ${SizeProp}`
  | `${SizeProp} ${SizeProp} ${SizeProp} ${SizeProp}`
  | [SizeProp, SizeProp]
  | [SizeProp, SizeProp, SizeProp, SizeProp]

type XYSizeProp =
  | SizeProp
  | `${SizeProp} ${SizeProp}`
  | `${SizeProp} ${SizeProp} ${SizeProp} ${SizeProp}`

declare global {
  const canvasx: JSXFactory

  type BaseProps = {
    bg?: BackgroundColorProp
    color?: ColorProp
  }

  type PositionProps = {
    size?: SizeProp
    width?: SizeProp
    height?: SizeProp
    x?: SizeProp
    y?: SizeProp
    z?: number
  }

  type BoxProps = PositionProps & {
    rounded?: RadiusProp
    composite?: GlobalCompositeOperation
    'f:blur'?: MaybePercent
    'f:brightness'?: MaybePercent
    'f:contrast'?: MaybePercent
    'f:drop-shadow'?: `${number}px ${number}px ${number}px ${ColorProp}`
    'f:grayscale'?: MaybePercent
    'f:hue-rotate'?: `${number}deg` | number | `${number}`
    'f:invert'?: MaybePercent
    'f:opacity'?: MaybePercent
    'f:saturate'?: MaybePercent
    'f:sepia'?: MaybePercent
  }

  type TextProps = {
    x?: SizeProp
    y?: SizeProp
    size?: SizeProp
    family?: string
    weight?: number
    letterSpacing?: number
    align?: 'left' | 'center' | 'right'
    baseline?: 'top' | 'middle' | 'bottom'
  }

  type FontDef = {
    family: string
    src: string
  }

  type CanvasxProps = BoxProps & {
    version: Version
    context: '2d' // Extend later
    renderer: 'node-canvas' | 'skia-canvas'
    output: 'png' | 'jpeg' | 'webp' | 'pdf'
    fonts?: FontDef[]
  }

  type PaddingProp =
    | {
        padding?: XYSizeProp
      }
    | {
        pad?: XYSizeProp
      }
    | { p?: XYSizeProp }

  type MarginProp =
    | {
        margin?: XYSizeProp
      }
    | { m?: XYSizeProp }

  type DirectionProp =
    | {
        direction?: 'row' | 'column'
      }
    | { dir?: 'row' | 'column' }

  type StackProps = PositionProps & {
    align?: 'start' | 'center' | 'end'
    'align:x'?: 'start' | 'center' | 'end'
    'align:y'?: 'start' | 'center' | 'end'
  }

  type FlexProps = StackProps & {
    wrap?: 'wrap' | 'nowrap'
    gap?: SizeProp
  } & PaddingProp &
    MarginProp &
    DirectionProp

  namespace JSX {
    type IntrinsicElements = {
      canvasx: BaseProps & CanvasxProps
      box: BaseProps & BoxProps
      text: BaseProps & TextProps
      img: IntrinsicElements['box'] & { src: string }
      flex: FlexProps
      stack: StackProps
    }

    type Element = CanvasxNode
  }
}
