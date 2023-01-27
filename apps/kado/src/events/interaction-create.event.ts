import { Events, Interaction } from 'discord.js'
import { CustomClient } from 'src/lib/discord.js/custom.client'
import { Event } from 'src/lib/decorators/event.decorator'
import { client } from 'src/handlers/client'

@Event({ name: Events.InteractionCreate })
export class InteractionCreateEvent {
  constructor(readonly client: CustomClient) {}

  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return

    const command = client.commands.get(interaction.commandName)

    if (!command) return

    await command.execute(interaction)
  }
}
