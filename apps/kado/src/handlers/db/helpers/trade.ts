import { Card, CardAttainmentType, CardDepartureType, User } from 'db'
import { User as DJSUser } from 'discord.js'
import inventory from 'src/handlers/db/helpers/inventory'
import history from 'src/handlers/db/helpers/history'
import { resolveCard, resolveUser } from 'src/handlers/db/helpers/resolver'

export type UnresolvedCard = Card | string
export type UnresolvedUser = User | DJSUser | string

export const trade = async (
  unresolvedCard: UnresolvedCard,
  unresolvedSender: UnresolvedUser,
  unresolvedReceiver: UnresolvedUser,
) => {
  const card = await resolveCard(unresolvedCard)
  const sender = await resolveUser(unresolvedSender)
  const receiver = await resolveUser(unresolvedReceiver)

  if (!card || !sender || !receiver) {
    throw new Error('Invalid card or user')
  }

  const lastHistory = await history.get(card.cin, sender.did)
  if (!lastHistory) {
    throw new Error('Sender does not own card')
  }

  await inventory.removeCard(sender.did, card.cin)
  await inventory.addCard(receiver.did, card.cin)

  await history.update(lastHistory.id, CardDepartureType.TRADED)
  await history.create(card.cin, receiver.did, CardAttainmentType.TRADED)

  return true
}
