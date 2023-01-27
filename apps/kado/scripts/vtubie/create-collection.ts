import { readFileSync } from 'fs'
import { resolve } from 'node:path'
import { db } from 'src/handlers/db'
import { generateCIN } from 'src/utils/generate-cin'
import { DirtLevel } from '@prisma/client'

const input = resolve(__dirname, 'data', 'scrape-final.json')

const TOTAL_PRINTS_PER_CARD = 4000

const getOrCreateCollection = async (name: string) => {
  const collection = await db.collection.findFirst({
    where: { name },
  })

  if (collection) {
    return collection
  }

  return db.collection.create({
    data: {
      name,
    },
  })
}

;(async () => {
  const startTime = Date.now()
  const data = readFileSync(input, 'utf-8').split('\n').filter(Boolean)

  const collection = await getOrCreateCollection('VTubers')

  const results = data.map(
    (line) =>
      JSON.parse(line) as {
        pc: string
        name: string
        languages: string[]
        genres: string[]
        description: string
        icon: string
      },
  )

  const total = results.length * TOTAL_PRINTS_PER_CARD
  let current = 0

  for (const card of results) {
    const ref = await db.cardRef.create({
      data: {
        name: card.name,
        description: card.description,
        icon: card.icon,
        collectionId: collection.id,
        totalPrintedCount: TOTAL_PRINTS_PER_CARD,
      },
    })

    const cards = await Promise.all(
      new Array(TOTAL_PRINTS_PER_CARD).fill(0).map(async (_, i) => {
        console.log(`Creating card ${i + 1} of 4000`)

        return {
          cin: generateCIN(card.pc + i, false),
          currentPrintNumber: i + 1,
          powerLevel: 1,
          dirtLevel: DirtLevel.NORMAL,
          refId: ref.id,
        }
      }),
    )

    for (const card of cards) {
      // we will use card ownership later to easily fetch random cards that are unowned
      console.log(`Inserting card ${card.cin}...`)
      await db.cardOwnershipRef.create({
        data: {
          card: {
            create: card,
          },
        },
      })

      console.log(
        `${((++current / total) * 100).toFixed(
          2,
        )}% (${current}/${total}) ETA: ${(
          ((Date.now() - startTime) / current) *
          (total - current)
        ).toFixed(0)}ms`,
      )
    }

    console.log(`Created ${cards.length} cards for ${card.name}`)
  }
})()
