import { createPermissions } from 'src/utils/discord-permissions'
import { Command } from 'src/lib/class/Command'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { ModServerAction } from '@prisma/client'
import { helpers } from 'db'

export class TimeoutCommand extends Command {
  name = 'to'
  description = '/to @User <Duration> <Reason>'
  permissions = createPermissions(['MuteMembers'])

  details = (details: SlashCommandBuilder) => {
    details
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('The user to timeout')
          .setRequired(true),
      )
      .addIntegerOption((option) =>
        option
          .setName('duration')
          .setDescription('Minutes to timeout for')
          .addChoices({
            name: '1 minute',
            value: 1,
          })
          .addChoices({
            name: '5 minutes (DEFAULT)',
            value: 5,
          })
          .addChoices({
            name: '15 minutes',
            value: 15,
          })
          .addChoices({
            name: '30 minutes',
            value: 30,
          })
          .addChoices({
            name: '1 hour',
            value: 60,
          })
          .addChoices({
            name: '5 hours',
            value: 300,
          })
          .addChoices({
            name: '12 hours',
            value: 720,
          })
          .addChoices({
            name: '24 hours',
            value: 1440,
          })
          .addChoices({
            name: '1 week',
            value: 10080,
          }),
      )
      .addStringOption((option) =>
        option.setName('reason').setDescription('The reason for the timeout'),
      )

    return details
  }

  async execute(interaction: ChatInputCommandInteraction<'cached'>) {
    const { db } = this.client
    const { guild, member, options } = interaction

    await interaction.deferReply({ ephemeral: true })

    const target = options.getUser('user', true)
    const duration = (options.getInteger('duration') ?? 5) * 60 * 1000
    const reason = options.getString('reason') ?? 'No reason provided'

    if (target.id === member.id) {
      return interaction.editReply({
        content: '... bruh.',
      })
    }

    const targetMember = await guild!.members.fetch(target.id)

    if (targetMember.roles.highest.position >= member.roles.highest.position) {
      return interaction.editReply({
        content: 'You cannot timeout this user',
      })
    }

    await targetMember.timeout(duration, reason)

    const dbUser = await helpers.user.tryGetOrCreateGuildMemberRef(targetMember)
    const dbModerator = await helpers.user.tryGetOrCreateGuildMemberRef(member)

    const offense = await db.guildMemberOffenseHistory.create({
      data: {
        action: ModServerAction.TIMEOUT,
        memberRefId: dbUser.id,
        moderatorId: dbModerator.id,
        reason,
      },
    })

    const embed = await this.client.logging.log(guild, offense)

    await interaction.editReply({
      embeds: [embed],
    })
  }
}
