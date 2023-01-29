import { createPermissions, promiseAsBoolean } from 'utils'
import { Command } from 'bot'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { ModServerAction } from '@prisma/client'
import { helpers } from 'db'
import { logging } from 'src/lib/systems/logging.system'
import { APIEmbed } from 'discord-api-types/v10'

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
          .setName('will-dm')
          .setDescription(
            "Whether to send the warning to the user or not (default is 'False')",
          )
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

    await interaction.deferReply()

    const targetUser = options.getUser('user', true)
    const willDm = options.getBoolean('will-dm') ?? false
    const reason = options.getString('reason') ?? 'No reason provided'

    if (targetUser.id === member.id) {
      return interaction.editReply({
        embeds: [
          logging.getEmbed(
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
        memberRefId: dbUser.userId,
        moderatorId: dbModerator.userId,
        reason,
      },
    })

    const embed = await logging.log(guild, offense)

    let dmSuccess = !willDm
    if (willDm) {
      dmSuccess = await promiseAsBoolean(
        targetMember.send({
          content: `You have been warned in ${guild!.name}:`,
          embeds: [embed],
        }),
      )
    }

    const embeds = [embed] satisfies APIEmbed[]

    if (!dmSuccess) {
      embeds.push({
        title: 'Failed to send embed to user.',
        color: 0xff0000,
      })
    }

    await interaction.editReply({
      embeds,
    })
  }
}
