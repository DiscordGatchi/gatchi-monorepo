import { Event, Events, GuildAuditLogEntryCreateRawData } from 'bot'
import { helpers } from 'db'
import { AuditLogEvent } from 'discord-api-types/v9'
import { ModChannelType } from '@prisma/client'
import { EmbedBuilder } from 'discord.js'
import { passValue } from 'utils'

enum Colors {
  ADD = /* #7bf186 */ 0x7bf186,
  REMOVE = /* #fff178 */ 0xfff178,
}

export class GuildAuditLogEntryCreateEvent extends Event(
  Events.GuildAuditLogEntryCreate,
) {
  override async execute(
    data: GuildAuditLogEntryCreateRawData & { guild_id?: string },
  ) {
    if (!data.guild_id) {
      return
    }
    if (!data.user_id) {
      return
    }
    if (!data.target_id) {
      return
    }

    const guild = await this.client.guilds.fetch(data.guild_id)
    const member = await guild.members
      .fetch(data.user_id)
      .catch(passValue(null))
    const target = await guild.members
      .fetch(data.target_id)
      .catch(passValue(null))
    const memberUpdateLogs = await helpers.settings.getGuildChannelByType(
      guild,
      ModChannelType.MEMBER_UPDATES_LOGS,
    )

    if (!memberUpdateLogs?.isTextBased()) {
      return
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: target?.user.tag ?? 'Unknown User',
        iconURL: target?.user.displayAvatarURL(),
      })
      .setFooter({
        text: `By ${member?.user.tag ?? 'Unknown User'}`,
        iconURL: member?.user.displayAvatarURL(),
      })
      .setTimestamp(new Date())

    switch (data.action_type) {
      case AuditLogEvent.MemberRoleUpdate: {
        for (const change of data.changes ?? []) {
          const roles = change.new_value as { id: string; name: string }[]

          embed.setDescription(roles.map((role) => `<@&${role.id}>`).join(', '))

          if (change.key === '$add') {
            await memberUpdateLogs.send({
              embeds: [embed.setTitle('Roles Added').setColor(Colors.ADD)],
            })
          } else if (change.key === '$remove') {
            await memberUpdateLogs.send({
              embeds: [embed.setTitle('Roles Removed').setColor(Colors.REMOVE)],
            })
          }
        }
        break
      }
      case AuditLogEvent.MemberUpdate: {
        embed
          .setTitle('Member Updated')
          .setColor(target?.displayColor ?? Colors.REMOVE)

        for (const change of data.changes ?? []) {
          if (change.key === 'nick') {
            embed.addFields({
              name: 'Nickname',
              value: `${change.old_value ?? 'None'} → ${
                change.new_value ?? 'None'
              }`,
              inline: true,
            })
          }
        }

        await memberUpdateLogs.send({ embeds: [embed] })

        break
      }
    }
  }
}
