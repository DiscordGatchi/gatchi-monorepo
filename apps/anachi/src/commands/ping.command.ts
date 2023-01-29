import { CommandInteraction } from 'discord.js'
import { Command } from 'bot'

export class PingCommand extends Command {
  name = 'ping'
  description = 'Pong!'

  async execute(interaction: CommandInteraction) {
    await interaction.reply('Pong!')
  }
}
