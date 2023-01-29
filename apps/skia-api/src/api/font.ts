import { FontLibrary } from 'skia-canvas'

const getFontPath = (name: string, type: string) =>
  `assets/fonts/${name}.${type}`

FontLibrary.use('Rubik', [getFontPath('rubik', 'ttf')])

if (!FontLibrary.has('Rubik')) {
  out.error('Font "Rubik" was not found!')
} else {
  out.info('Font "Rubik" was found!')
}
