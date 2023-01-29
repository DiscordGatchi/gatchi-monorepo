import { ClientEvents, Collection } from 'discord.js'
import { CustomClient } from 'src/lib/custom.client'
import { EventCls, IEvent } from 'src/lib/class/Event'

export class EventsRegister extends Collection<
  keyof ClientEvents,
  IEvent<keyof ClientEvents>
> {
  constructor(private readonly client: CustomClient) {
    super()
  }

  public start() {
    this.forEach((event, name) =>
      this.client[event.type](name, event.execute.bind(event)),
    )
  }

  public register<C extends EventCls<keyof ClientEvents>>(Event: C) {
    const event = new Event(this.client)
    this.set(event.name, event)
    out.info(`Registered event ${event.name} (${event.type})`)
  }
}
