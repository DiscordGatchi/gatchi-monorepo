import { readFileSync, appendFile } from 'fs'
import { resolve } from 'node:path'
import { omit } from 'lodash'
import { load } from 'cheerio'

const input = resolve(__dirname, 'data', 'scrape-with-images.json')
const output = resolve(__dirname, 'data', 'scrape-final.json')

;(async () => {
  const data = readFileSync(input, 'utf-8').split('\n').filter(Boolean)
  const length = data.length

  // do 10 at a time
  const chunkSize = 40
  const chunks = Math.ceil(length / chunkSize)
  for (let i = 0; i < chunks; i++) {
    const chunk = data.slice(i * chunkSize, (i + 1) * chunkSize)
    const promises = chunk.map(async (line) => {
      const original = JSON.parse(line)
      const { pageUrl } = original
      const html = await fetch(pageUrl).then((res) => res.text())
      const $ = load(html)

      const description = $('.ma-section-description p').text().trim()

      return {
        ...omit(original, ['pageUrl']),
        description,
      }
    })

    const results = await Promise.all(promises)
    const filtered = results.filter(Boolean)

    appendFile(
      output,
      `${filtered.map((d) => JSON.stringify(d)).join('\n')}`,
      (err) => {
        if (err) {
          console.error(err)
        }
      },
    )

    console.log(`Done with chunk ${i + 1}/${chunks}`)
  }

  console.log('\x07')
})()
