import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { createPermissions } from 'utils'
import { Command, Events } from 'bot'

export class ForceWelcomeCommand extends Command {
  name = 'force-welcome'
  description = 'Force welcome a user.'
  permissions = createPermissions(['Administrator'])

  details = (details: SlashCommandBuilder) => {
    details.addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to welcome.')
        .setRequired(true),
    )
    return details
  }

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return

    const user = interaction.options.getUser('user', true)
    const member = await interaction.guild.members.fetch(user.id)

    this.client.emit(Events.GuildMemberAdd, member)

    await interaction.reply({ ephemeral: true, content: 'Done!' })
  }
}
