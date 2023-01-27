import { createPermissions } from 'src/utils/discord-permissions'
import { Command } from 'src/lib/class/Command'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { ModServerAction } from '@prisma/client'
import { helpers } from 'db'

export class UnbanCommand extends Command {
  name = 'unban'
  description = '/unban <User-ID> <Reason>'
  permissions = createPermissions(['BanMembers'])

  details = (details: SlashCommandBuilder) => {
    details
      .addStringOption((option) =>
        option
          .setName('user-id')
          .setDescription('The ID of the user to unban')
          .setRequired(true),
      )
      .addStringOption((option) =>
        option.setName('reason').setDescription('The reason for the unban'),
      )

    return details
  }

  async execute(interaction: ChatInputCommandInteraction<'cached'>) {
    const { db } = this.client
    const { guild, member, options } = interaction

    await interaction.deferReply({ ephemeral: true })

    const targetUserId = options.getString('user-id', true)
    const reason = options.getString('reason') ?? 'No reason provided'

    if (targetUserId === member.id) {
      return interaction.editReply({
        content: "You clearly don't own an air fryer",
      })
    }

    await guild.members.unban(targetUserId, reason)

    const dbUser = await db.guildMemberRef.upsert({
      where: { id: targetUserId },
      update: {},
      create: {
        id: targetUserId,
        name: 'unknown',
        discriminator: '0000',
      },
    })
    const dbModerator = await helpers.user.tryGetOrCreateGuildMemberRef(member)

    const offense = await db.guildMemberOffenseHistory.create({
      data: {
        action: ModServerAction.UNBAN,
        memberRefId: dbUser?.id ?? 'unknown-user',
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
