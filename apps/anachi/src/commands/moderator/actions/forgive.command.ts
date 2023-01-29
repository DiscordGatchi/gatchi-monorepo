import { createPermissions } from 'utils'
import { Command } from 'bot'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { ModServerAction } from '@prisma/client'
import { logging } from 'src/lib/systems/logging.system'

export class ForgiveCommand extends Command {
  name = 'forgive'
  description = '/forgive Case-Id <Reason>'
  permissions = createPermissions(['KickMembers'])

  details = (details: SlashCommandBuilder) => {
    details
      .addNumberOption((option) =>
        option
          .setName('case-id')
          .setDescription('The (case) ID to forgive')
          .setRequired(true),
      )
      .addStringOption((option) =>
        option.setName('reason').setDescription('The reason for the forgive'),
      )

    return details
  }

  async execute(interaction: ChatInputCommandInteraction<'cached'>) {
    const { db } = this.client
    const { guild, member, options } = interaction

    await interaction.deferReply({ ephemeral: true })

    const caseId = options.getNumber('case-id', true)
    const reason = options.getString('reason') ?? 'No reason provided'

    const dbCase = await db.guildMemberOffenseHistory.findUnique({
      where: { id: caseId },
    })

    if (!dbCase) {
      return interaction.editReply({
        content: `Case \`${caseId}\` does not exist`,
      })
    }

    if (dbCase.action === ModServerAction.FORGIVE) {
      return interaction.editReply({
        embeds: [
          logging.getEmbed(
            '!!! BREAKING NEWS !!!',
            ModServerAction.FORGIVE,
            member.id,
            member.id,
            696969,
            false,
            '***Colossal brain moderator tries to forgive a forgive case.***',
          ),
        ],
      })
    }

    if (dbCase.forgiven) {
      return interaction.editReply({
        content: `Case \`${caseId}\` has already been forgiven`,
      })
    }

    await db.guildMemberOffenseHistory.update({
      where: { id: caseId },
      data: {
        forgiven: true,
      },
    })

    const offense = await db.guildMemberOffenseHistory.create({
      data: {
        action: ModServerAction.FORGIVE,
        memberRefId: dbCase.memberRefId,
        moderatorId: member.id,
        reason,
      },
    })

    const embed = await logging.log(guild, offense, {
      title: `Case #${caseId} Forgiven`,
    })

    await interaction.editReply({
      embeds: [embed],
    })
  }
}
