import { Card, User } from '@prisma/client'
import { User as DJSUser } from 'discord.js'
import { db } from 'db'

export const resolveCard = (card: Card | string) =>
  typeof card === 'string' ? db.card.findUnique({ where: { cin: card } }) : card
export const resolveUser = (user: User | DJSUser | string) =>
  typeof user === 'string' || 'bot' in user
    ? db.user.findUnique({
        where: { did: typeof user === 'string' ? user : user.id },
      })
    : user
