import { CardIssue, CardPrint, db, DirtLevel } from 'db'
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

export const createCardIssue = ({
  cardId,
  printCount,
}: Omit<CardIssue, 'id' | 'issueDate'>) =>
  db.cardIssue.create({
    data: {
      issueDate: new Date(),
      printCount,
      card: {
        connect: {
          id: cardId,
        },
      },
    },
  })

export const createCardPrint = ({
  ownerId,
  cardId,
  ...details
}: Omit<CardPrint, 'id' | 'dirtLevel'>) =>
  db.cardPrint.create({
    data: {
      dirtLevel: DirtLevel.NORMAL,
      ...details,
      card: {
        connect: {
          id: cardId,
        },
      },
      owner: {
        connect: {
          id: ownerId,
        },
      },
    },
  })

export const createUser = (user: User) =>
  db.user.create({
    data: {
      id: user.id,
    },
  })
