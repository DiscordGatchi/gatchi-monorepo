import { readFileSync, writeFile, appendFile } from 'fs'
import { resolve } from 'node:path'
import { kebabCase, omit } from 'lodash'

const input = resolve(__dirname, 'data', 'bare-scrape.json')
const output = resolve(__dirname, 'data', 'scrape-with-images.json')
const image_dir = resolve(__dirname, 'data', 'images')

;(async () => {
  const data = readFileSync(input, 'utf-8').split('\n')
  const length = data.length
  for (let i = 0; i < length; i++) {
    const line = data[i]
    if (!line) {
      continue
    }
    const original = JSON.parse(line)
    const { name, imageUrl } = original
    if (!imageUrl) {
      console.error(`No 'imageUrl' for ${name}`)
      continue
    }
    const image = await fetch(
      imageUrl.replace(/-[0-9]+x[0-9]+\./gim, '.'),
    ).then((res) => res.blob())
    const imageBuffer = await image.arrayBuffer()
    const ext = image.type.split('/')[1]
    if (!ext) {
      console.error(`No 'ext' found for ${name}`)
      continue
    }

    const imageFileName = `${kebabCase(name)}.${ext}`

    writeFile(
      resolve(image_dir, imageFileName),
      Buffer.from(imageBuffer),
      (err) => {
        if (err) {
          console.error(err)
        }
      },
    )

    appendFile(
      output,
      `${JSON.stringify({
        ...omit(original, ['imageUrl']),
        icon: imageFileName,
      })}\n`,
      (err) => {
        if (err) {
          console.error(err)
        }
      },
    )

    console.log(`Done with ${name} (${i + 1}/${length})`)
  }
})()
