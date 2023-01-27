import logger from 'src/utils/logs'
import { ClientEvents, Collection } from 'discord.js'
import { CustomClient } from 'src/lib/discord.js/custom.client'
import { IEvent, IEventClass } from 'src/lib/decorators/event.decorator'

export class EventsRegister extends Collection<
  Exclude<string, keyof ClientEvents>,
  IEvent
> {
  constructor(private readonly client: CustomClient) {
    super()
  }

  public start() {
    this.forEach((event, name) => {
      this.client[event.once ? 'once' : 'on'](name, event.execute.bind(event))
    })
  }

  public register(Event: IEventClass) {
    const event = new Event(this.client)
    this.set(event.name!, event)
    logger.info(`Registered event ${event.name}`)
  }
}
