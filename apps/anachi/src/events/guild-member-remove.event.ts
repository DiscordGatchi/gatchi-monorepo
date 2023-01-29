import { APIEmbedField, ChannelType, Events, GuildMember } from 'discord.js'
import { helpers } from 'db'
import { ModChannelType } from '@prisma/client'
import { Event } from 'bot'
import { getDateAsDiscordTimestamp } from 'utils'

export class GuildMemberRemoveEvent extends Event(Events.GuildMemberRemove) {
  override async execute(member: GuildMember) {
    const memberRef = await helpers.user.tryGetOrCreateGuildMemberRef(member)
    const joinLeaveLogs = await helpers.settings.getGuildChannelByType(
      member.guild,
      ModChannelType.JOIN_LEAVE_LOGS,
    )

    if (joinLeaveLogs && joinLeaveLogs.type === ChannelType.GuildText) {
      const fields: APIEmbedField[] = [
        {
          name: 'User ID',
          value: member.user.id,
          inline: true,
        },
        {
          name: 'New Member Count',
          value: member.guild.memberCount.toString(),
          inline: true,
        },
        {
          name: 'Account Created',
          value: getDateAsDiscordTimestamp(member.user.createdAt, true),
          inline: true,
        },
        {
          name: 'First Join Date',
          value: getDateAsDiscordTimestamp(memberRef.createdAt, true),
          inline: true,
        },
        {
          name: 'Roles',
          value: member.roles.cache.map((r) => r.toString()).join(', '),
        },
      ]

      if (member.joinedAt) {
        fields.push({
          name: 'Latest Join Date',
          value: getDateAsDiscordTimestamp(member.joinedAt, true),
          inline: true,
        })
      }

      await joinLeaveLogs.send({
        embeds: [
          {
            title: 'Member Left',
            color: member.displayColor,
            author: {
              name: member.user.tag,
              icon_url: member.user.displayAvatarURL(),
            },
            fields,
            timestamp: new Date().toISOString(),
          },
        ],
      })
    }
  }
}
