import { db, CardAttainmentType, CardDepartureType } from 'db'

const get = (cin: string, ownerId: string) =>
  db.cardHistory.findFirst({ where: { ownerId, cardId: cin } })

const create = (
  cin: string,
  ownerId: string,
  attainmentType: CardAttainmentType,
) =>
  db.cardHistory.create({
    data: {
      cardId: cin,
      ownerId,
      attainedAt: new Date(),
      attainedType: attainmentType,
    },
  })

const update = (id: number, departureType: CardDepartureType) =>
  db.cardHistory.update({
    where: {
      id,
    },
    data: {
      departedAt: new Date(),
      departedType: departureType,
    },
  })

export default { get, create, update }
