import { CardPrint, User } from '@prisma/client'
import { User as DJSUser } from 'discord.js'
import { db } from 'db'

export const resolveCardPrint = (print: CardPrint | string) =>
  typeof print === 'string'
    ? db.cardPrint.findUnique({ where: { cin: print } })
    : print

export const resolveUser = (user: User | DJSUser | string) =>
  typeof user === 'string' || 'bot' in user
    ? db.user.findUnique({
        where: { did: typeof user === 'string' ? user : user.id },
      })
    : user
