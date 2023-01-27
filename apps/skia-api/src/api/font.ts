import { FontLibrary } from 'skia-canvas'

const getFontPath = (name: string, type: string) =>
  `assets/fonts/${name}.${type}`

FontLibrary.use('Rubik', [getFontPath('rubik', 'ttf')])

if (!FontLibrary.has('Rubik')) {
  console.error('Font "Rubik" was not found!')
} else {
  console.log('Font "Rubik" was found!')
}
