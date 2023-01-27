import { CommandInteraction } from 'discord.js'
import { Command, ICommand } from 'src/lib/decorators/command.decorator'
import { CustomClient } from 'src/lib/discord.js/custom.client'

@Command({
  name: 'ping',
  description: 'Pong!',
})
export class PingCommand implements ICommand {
  constructor(readonly client: CustomClient) {}

  async execute(interaction: CommandInteraction) {
    await interaction.reply('Pong!')
  }
}
