import { FontLibrary } from 'skia-canvas'

const getFontPath = (name: string, type: string) =>
  `assets/fonts/${name}.${type}`

const loadFont = (familyName: string, fileName: string) => {
  FontLibrary.use(familyName, [getFontPath(fileName, 'ttf')])

  if (!FontLibrary.has(familyName)) {
    out.error(`Font "${familyName}" was not found!`)
  } else {
    out.info(`Font "${familyName}" was found!`)
  }
}

loadFont('Rubik', 'rubik')
loadFont('Patrick', 'patrick')
loadFont('Pangolin', 'pangolin')
