import { Events, Interaction } from 'discord.js'
import { client } from 'src/handlers/client'
import { Event } from 'bot'

export class InteractionCreateEvent extends Event(Events.InteractionCreate) {
  override async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return

    const command = client.commands.get(interaction.commandName)

    if (!command) return

    await command.execute(interaction)
  }
}
