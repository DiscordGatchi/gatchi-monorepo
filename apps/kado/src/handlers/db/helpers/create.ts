import { db, Card, CardRef } from 'db'
import { User } from 'discord.js'

export const createCollection = (name: string) =>
  db.collection.create({
    data: {
      name,
    },
  })

export const getOrCreateCollection = async (name: string) => {
  const collection = await db.collection.findFirst({
    where: { name },
  })

  if (collection) {
    return collection
  }

  return createCollection(name)
}

export const createCard = async (
  cardRefId: number,
  card: Omit<Card, 'id' | 'refId'>,
) =>
  db.card.create({
    data: {
      ...card,
      ref: {
        connect: {
          id: cardRefId,
        },
      },
    },
  })

export const createAndStoreRandomCardInCollection = async (
  collectionName: string,
  user: User,
) => {}

export const createUser = (user: User) =>
  db.user.create({
    data: {
      did: user.id,
    },
  })
