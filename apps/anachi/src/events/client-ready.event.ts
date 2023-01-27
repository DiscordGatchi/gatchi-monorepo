import { Events } from 'discord.js'
import logger from 'src/utils/logs'
import { Event, EventType } from 'src/lib/class/Event'

export class ClientReadyEvent extends Event(Events.ClientReady) {
  type = EventType.SINGLE

  override async execute() {
    logger.info(`Loaded ${this.client.events.size} events.`)
    logger.info(`Loaded ${this.client.commands.size} commands.`)
    logger.info(
      `Client for application ${
        this.client.user?.username ?? 'UNKNOWN_APP'
      } is ready.`,
    )
  }
}
