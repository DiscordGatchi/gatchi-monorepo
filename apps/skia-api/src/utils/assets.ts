import { resolve } from 'node:path'
import { ASSETS_PATH } from 'src/constants'

export const getAssetImage = (...paths: string[]) => {
  if (paths.length === 1) {
    return resolve(ASSETS_PATH, `${paths[0]}.png`)
  }

  const last = `${paths.pop()}.png`
  return resolve(ASSETS_PATH, ...paths, last)
}
