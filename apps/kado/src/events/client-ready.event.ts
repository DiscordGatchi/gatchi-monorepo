import { Events } from 'discord.js'
import { CustomClient } from 'src/lib/discord.js/custom.client'
import { Event } from 'src/lib/decorators/event.decorator'
import logger from 'src/utils/logs'

@Event({ name: Events.ClientReady, once: true })
export class ClientReadyEvent {
  constructor(readonly client: CustomClient) {}

  async execute() {
    logger.info(`Loaded ${this.client.events.size} events.`)
    logger.info(`Loaded ${this.client.commands.size} commands.`)
    logger.info(
      `Client for application ${
        this.client.user?.username ?? 'UNKNOWN_APP'
      } is ready.`,
    )
  }
}
