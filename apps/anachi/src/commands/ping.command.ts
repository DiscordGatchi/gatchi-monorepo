import { CommandInteraction } from 'discord.js'
import { Command } from 'src/lib/class/Command'

export class PingCommand extends Command {
  name = 'ping'
  description = 'Pong!'

  async execute(interaction: CommandInteraction) {
    await interaction.reply('Pong!')
  }
}
