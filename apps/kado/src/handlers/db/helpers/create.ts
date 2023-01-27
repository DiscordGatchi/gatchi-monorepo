import { db, Card } from 'db'
import { User } from 'discord.js'

export const createCollection = (name: string) =>
  db.collection.create({
    data: {
      name,
    },
  })

export const createCard = async (
  collectionName: string,
  card: Omit<Card, 'collectionId'>,
) => {
  const collection = await db.collection.findFirst({
    where: { name: collectionName },
    select: {
      id: true,
    },
  })

  if (!collection) {
    throw new Error('Collection not found')
  }

  return db.card.create({
    data: {
      ...card,
      collectionId: collection.id,
    },
  })
}

export const createUser = (user: User) =>
  db.user.create({
    data: {
      did: user.id,
    },
  })
