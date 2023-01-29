import { createPermissions } from 'utils'
import { Command } from 'bot'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { ModServerAction } from '@prisma/client'
import { helpers } from 'db'
import { logging } from 'src/lib/systems/logging.system'

export class UntimeoutCommand extends Command {
  name = 'uto'
  description = '/uto @User <Reason>'
  permissions = createPermissions(['MuteMembers'])

  details = (details: SlashCommandBuilder) => {
    details
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('The user to untimeout')
          .setRequired(true),
      )
      .addStringOption((option) =>
        option.setName('reason').setDescription('The reason for the untimeout'),
      )

    return details
  }

  async execute(interaction: ChatInputCommandInteraction<'cached'>) {
    const { db } = this.client
    const { guild, member, options } = interaction

    await interaction.deferReply()

    const target = options.getUser('user', true)
    const reason = options.getString('reason') ?? 'No reason provided'

    if (target.id === member.id) {
      return interaction.editReply({
        content: 'stop',
      })
    }

    const targetMember = await guild!.members.fetch(target.id)

    if (targetMember.roles.highest.position >= member.roles.highest.position) {
      return interaction.editReply({
        content: 'You cannot untimeout this user',
      })
    }

    await targetMember.timeout(null, reason)

    const dbUser = await helpers.user.tryGetOrCreateGuildMemberRef(targetMember)
    const dbModerator = await helpers.user.tryGetOrCreateGuildMemberRef(member)

    const offense = await db.guildMemberOffenseHistory.create({
      data: {
        action: ModServerAction.UNTIMEOUT,
        memberRefId: dbUser.userId,
        moderatorId: dbModerator.userId,
        reason,
      },
    })

    const embed = await logging.log(guild, offense)

    await interaction.editReply({
      embeds: [embed],
    })
  }
}
