import { db } from 'db'
import { getCollectionData } from 'src/utils/getCollectionData'
import { kebabCase } from 'lodash'
import { getOrCreateCollection } from 'src/handlers/db/helpers/create'
import { convertSeedFromString } from 'utils'

export const dbInitCollection = async (
  collectionName: string,
  printCountPerCard: number,
) => {
  const sub = out.sub(`db-init(${collectionName})`)

  const data = getCollectionData<{
    name: string
    languages: string[]
    genres: string[]
    description: string
    icon: string
  }>(kebabCase(collectionName))

  sub.info(`Fetching collection ${collectionName}...`)
  const collection = await getOrCreateCollection(collectionName)

  if ((await db.card.count()) > 0) {
    sub.info('Cards already exist, skipping.')
  } else {
    sub.info(`Creating cards for ${collectionName}...`)
    await db.card.createMany({
      data: data.map((item) => ({
        name: item.name,
        icon: item.icon,
        description: item.description,
        seed: convertSeedFromString(item.name),
        collectionId: collection.id,
      })),
    })
  }

  if ((await db.cardIssue.count()) > 0) {
    sub.info('Card issues already exist, skipping.')
  } else {
    sub.info(`Creating card issues for ${collectionName}...`)
    const cards = await db.card.findMany({
      where: {
        collectionId: collection.id,
      },
      select: {
        id: true,
      },
    })
    await db.cardIssue.createMany({
      data: cards.map((item) => ({
        issueDate: new Date(),
        cardId: item.id,
        printCount: printCountPerCard,
      })),
    })
  }

  sub.info(`Done for ${collectionName}!`)
}
