import { Client, ClientOptions } from 'discord.js'
import { Database, db } from 'src/handlers/db'
import { EventsRegister } from 'src/lib/registers/events.register'
import { CommandsRegister } from 'src/lib/registers/commands.register'
import logger from 'src/utils/logs'

export class CustomClient extends Client {
  public readonly db: Database = db

  public readonly events: EventsRegister
  public readonly commands: CommandsRegister

  constructor(options: ClientOptions) {
    super(options)
    logger.info('Starting client...')
    this.events = new EventsRegister(this)
    this.commands = new CommandsRegister(this)
  }

  public async start(token?: string) {
    await this.db.$connect()
    this.events.start()
    return super.login(token)
  }
}
