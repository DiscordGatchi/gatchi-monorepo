import { Client, ClientOptions, Guild } from 'discord.js'
import { Database, db } from 'db'
import { EventsRegister } from 'src/lib/registers/events.register'
import { CommandsRegister } from 'src/lib/registers/commands.register'
import { Events } from 'src/lib/events'

export class CustomClient extends Client {
  public readonly db: Database = db

  public guild: Guild | null = null

  public readonly events: EventsRegister
  public readonly commands: CommandsRegister

  constructor(options: ClientOptions) {
    super(options)
    out.info('Starting client...')
    this.events = new EventsRegister(this)
    this.commands = new CommandsRegister(this)

    this.on(Events.Raw, (packet) => {
      console.log('packet', packet.t)
      if (packet.t === 'GUILD_AUDIT_LOG_ENTRY_CREATE') {
        this.emit(Events.GuildAuditLogEntryCreate, packet.d)
      }
    })
  }

  public async start(token?: string) {
    await this.db.$connect()
    this.events.start()
    return super.login(token)
  }
}
