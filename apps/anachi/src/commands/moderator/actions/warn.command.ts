import { createPermissions } from 'src/utils/discord-permissions'
import { Command } from 'src/lib/class/Command'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { ModServerAction } from '@prisma/client'
import { helpers } from 'db'

export class WarnCommand extends Command {
  name = 'warn'
  description = '/warn @User <Reason>'
  permissions = createPermissions(['KickMembers'])

  details = (details: SlashCommandBuilder) => {
    details
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('The user to warn')
          .setRequired(true),
      )
      .addBooleanOption((option) =>
        option
          .setName('is-public')
          .setDescription('Whether to warn silently or not (default is "TRUE")')
          .setRequired(false),
      )
      .addStringOption((option) =>
        option.setName('reason').setDescription('The reason for the warn'),
      )

    return details
  }

  async execute(interaction: ChatInputCommandInteraction<'cached'>) {
    const { db } = this.client
    const { guild, member, options } = interaction

    await interaction.deferReply({ ephemeral: true })

    const targetUser = options.getUser('user', true)
    const isPublic = options.getBoolean('is-public') ?? true
    const reason = options.getString('reason') ?? 'No reason provided'

    if (targetUser.id === member.id) {
      return interaction.editReply({
        embeds: [
          this.client.logging.getEmbed(
            'Smart Warning',
            ModServerAction.WARNING,
            member.id,
            member.id,
            69420,
            false,
            'Wowzers, you have been warned for being a very smart moderator :)',
          ),
        ],
      })
    }

    const targetMember = await guild!.members.fetch(targetUser.id)

    if (targetMember.roles.highest.position >= member.roles.highest.position) {
      return interaction.editReply({
        content: 'You cannot warn this user',
      })
    }

    const dbUser = await helpers.user.tryGetOrCreateGuildMemberRef(targetMember)
    const dbModerator = await helpers.user.tryGetOrCreateGuildMemberRef(member)

    const offense = await db.guildMemberOffenseHistory.create({
      data: {
        action: ModServerAction.WARNING,
        memberRefId: dbUser.id,
        moderatorId: dbModerator.id,
        reason,
      },
    })

    const embed = await this.client.logging.log(guild, offense, { isPublic })

    await interaction.editReply({
      embeds: [embed],
    })
  }
}
