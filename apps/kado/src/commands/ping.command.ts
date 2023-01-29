import { Command } from 'bot'
import { CommandInteraction } from 'discord.js'

export class PingCommand extends Command {
  name = 'ping'
  description = 'Pong!'

  async execute(interaction: CommandInteraction) {
    await interaction.reply('Pong!')
  }
}
