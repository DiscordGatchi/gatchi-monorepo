import { db } from 'src/handlers/db'
import { sqltag } from '@prisma/client/runtime'

db.$queryRaw(sqltag`DROP TABLE "Card" CASCADE`).catch(console.error)
db.$queryRaw(sqltag`DROP TABLE "CardRef" CASCADE`).catch(console.error)
db.$queryRaw(sqltag`DROP TABLE "CardOwnershipRef" CASCADE`).catch(console.error)
