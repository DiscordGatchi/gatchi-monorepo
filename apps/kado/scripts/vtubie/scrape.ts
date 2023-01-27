import { load } from 'cheerio'
import { appendFileSync, existsSync } from 'fs'
import { resolve } from 'node:path'

const url = 'https://vtubie.com/allvtubers/'

;(async () => {
  const handlePage = async (n: number) => {
    console.log(`    Fetching page ${n}...`)
    const res = await fetch(`${url}?pg=${n}`)
    const text = await res.text()

    console.log('    Done!')

    const $ = load(text)

    console.log(`    Parsing page ${n}...`)

    const results: any[] = []
    const unresolved = $('.ma-n-bro tbody tr')
      .map(async (i, el) => {
        const name = $(el).find('.ma-n-bro-title').text()

        const pageUrl = $(el).find('.ma-n-bro-img-link').attr('href')

        const imageUrl = $(el)
          .find('.ma-n-bro-img')
          .attr('style')
          ?.replace(/background-image.+url\((.*)\)/, '$1')

        const languages = $(el)
          .find('.ma-n-bro-lang')
          .map((i, el) => $(el).attr('title'))
          .toArray()

        const genres = $(el)
          .find('.ma-n-bro-genre li:not(.ma-n-bro-lang)')
          .map((i, el) => $(el).text())
          .toArray()

        return {
          pc: `p${n}-c${i}`,
          name,
          pageUrl,
          imageUrl,
          languages,
          genres,
          description: null,
        }
      })
      .toArray()

    for (const result of unresolved) {
      results.push(await result)
    }

    return results
  }

  let isDone = false
  let page = 1

  const out = resolve(__dirname, 'data', 'bare-scrape.json')

  if (!existsSync(out)) {
    appendFileSync(out, '\n')
  }

  while (!isDone) {
    console.log(`Scraping page ${page}...`)
    const pageResults = await handlePage(page)
    console.log('Page complete:\n', { id: page, results: pageResults.length })

    if (pageResults.length === 0) {
      isDone = true
    } else {
      page++
    }

    for (const result of pageResults) {
      appendFileSync(out, JSON.stringify(result) + '\n')
    }
  }
})()
