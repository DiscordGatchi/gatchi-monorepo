import { db, PrintAttainmentType, PrintDepartureType } from 'db'

const get = (printId: string, ownerId: string) =>
  db.printOwnerHistory.findFirst({ where: { ownerId, printId } })

const create = (
  printId: string,
  ownerId: string,
  attainmentType: PrintAttainmentType,
) =>
  db.printOwnerHistory.create({
    data: {
      printId,
      ownerId,
      attainedAt: new Date(),
      attainedType: attainmentType,
    },
  })

const update = (id: number, departureType: PrintDepartureType) =>
  db.printOwnerHistory.update({
    where: {
      id,
    },
    data: {
      departedAt: new Date(),
      departedType: departureType,
    },
  })

export default { get, create, update }
