import { Client, ClientOptions } from 'discord.js'
import { Database, db } from 'db'
import { EventsRegister } from 'src/lib/registers/events.register'
import { CommandsRegister } from 'src/lib/registers/commands.register'
import logger from 'src/utils/logs'
import { getOrCreateCollection } from 'src/handlers/db/helpers/create'
import { getCollectionData } from 'src/utils/getCollectionData'
import { kebabCase } from 'lodash'

export class CustomClient extends Client {
  public readonly db: Database = db
  public cardRefCount?: number

  public readonly events: EventsRegister
  public readonly commands: CommandsRegister

  constructor(options: ClientOptions) {
    super(options)
    logger.info('Starting client...')
    this.events = new EventsRegister(this)
    this.commands = new CommandsRegister(this)
  }

  async insertIfNotExists(collectionName: string, totalPrintedCount: number) {
    const cardsExists = await db.cardRef.count()
    if (cardsExists !== 0) {
      logger.info(
        `Collection ${collectionName} already has cards generated (${cardsExists}).`,
      )
      return
    }

    logger.info(
      `There are no cards for collection ${collectionName}, inserting...`,
    )

    const collection = await getOrCreateCollection(collectionName)

    const data = getCollectionData<{
      name: string
      icon: string
      description: string
    }>(kebabCase(collectionName))

    const cards = await db.cardRef.createMany({
      data: data.map((item) => ({
        name: item.name,
        icon: item.icon,
        description: item.description,
        totalPrintedCount,
        collectionId: collection.id,
      })),
    })

    logger.info(
      `Inserted ${cards.count} cards for collection ${collectionName}.`,
    )
  }

  public async start(token?: string) {
    await this.db.$connect()

    this.cardRefCount = await db.cardRef.count()
    await this.insertIfNotExists('VTubers', 9000)

    this.events.start()
    return super.login(token)
  }
}
