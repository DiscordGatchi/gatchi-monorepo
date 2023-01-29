import { createPermissions } from 'utils'
import { Command } from 'bot'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { ModServerAction } from '@prisma/client'
import { helpers } from 'db'
import { logging } from 'src/lib/systems/logging.system'

export class BanCommand extends Command {
  name = 'ban'
  description = '/ban @User <Reason>'
  permissions = createPermissions(['BanMembers'])

  details = (details: SlashCommandBuilder) => {
    details
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('The user to ban')
          .setRequired(true),
      )
      .addStringOption((option) =>
        option.setName('reason').setDescription('The reason for the ban'),
      )

    return details
  }

  async execute(interaction: ChatInputCommandInteraction<'cached'>) {
    const { db } = this.client
    const { guild, member, options } = interaction

    await interaction.deferReply({ ephemeral: true })

    const target = options.getUser('user', true)
    const reason = options.getString('reason') ?? 'No reason provided'

    if (target.id === member.user.id) {
      return interaction.editReply({
        content: 'You cannot ban yourself',
      })
    }

    const targetMember = await guild.members.fetch(target.id)

    if (targetMember.roles.highest.position >= member.roles.highest.position) {
      return interaction.editReply({
        content: 'You cannot ban this user',
      })
    }

    await targetMember.ban({ reason })

    const dbUser = await helpers.user.tryGetOrCreateGuildMemberRef(targetMember)
    const dbModerator = await helpers.user.tryGetOrCreateGuildMemberRef(member)

    const offense = await db.guildMemberOffenseHistory.create({
      data: {
        action: ModServerAction.BAN,
        memberRefId: dbUser.id,
        moderatorId: dbModerator.id,
        reason,
      },
    })

    const embed = await logging.log(guild, offense)

    await interaction.editReply({
      embeds: [embed],
    })
  }
}
