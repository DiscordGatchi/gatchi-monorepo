import { Events } from 'discord.js'
import { Event, EventType } from 'bot'

export class ClientReadyEvent extends Event(Events.ClientReady) {
  type = EventType.SINGLE

  async execute() {
    out.info(`Loaded ${this.client.events.size} events.`)
    out.info(`Loaded ${this.client.commands.size} commands.`)
    out.info(
      `Client for application ${
        this.client.user?.username ?? 'UNKNOWN_APP'
      } is ready.`,
    )
  }
}
