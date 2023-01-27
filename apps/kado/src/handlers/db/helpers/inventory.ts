import { db } from 'db'

enum InventoryCardUpdateAction {
  ADD = 'connect',
  REMOVE = 'disconnect',
}

const updateCard = (
  did: string,
  cin: string,
  type: InventoryCardUpdateAction,
) =>
  db.user.update({
    where: { did },
    data: {
      cards: { [type]: { cin } },
    },
  })

const addCard = (did: string, cin: string) =>
  updateCard(did, cin, InventoryCardUpdateAction.ADD)

const removeCard = (did: string, cin: string) =>
  updateCard(did, cin, InventoryCardUpdateAction.REMOVE)

export default { addCard, removeCard, updateCard }
