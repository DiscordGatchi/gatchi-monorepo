import { APIEmbedField, ChannelType, Events, GuildMember } from 'discord.js'
import { helpers } from 'db'
import { ModChannelType } from '@prisma/client'
import { Event } from 'bot'
import {
  clearHoistedNickname,
  getDateAsDiscordTimestamp,
  isHoisting,
} from 'utils'
import moment from 'moment'

export class GuildMemberAddEvent extends Event(Events.GuildMemberAdd) {
  override async execute(member: GuildMember) {
    const memberRef = await helpers.user.tryGetOrCreateGuildMemberRef(member)
    const welcomeLog = await helpers.settings.getGuildChannelByType(
      member.guild,
      ModChannelType.GREETING_LOGS,
    )

    const joinLeaveLogs = await helpers.settings.getGuildChannelByType(
      member.guild,
      ModChannelType.JOIN_LEAVE_LOGS,
    )

    if (joinLeaveLogs && joinLeaveLogs.type === ChannelType.GuildText) {
      const now = new Date()
      const hasJoinedBefore = moment(memberRef.createdAt).isBefore(
        now.setMinutes(now.getMinutes() - 1),
      )
        ? getDateAsDiscordTimestamp(memberRef.createdAt, true)
        : 'No'

      await joinLeaveLogs.send({
        embeds: [
          {
            title: 'Member Joined',
            color: member.displayColor,
            author: {
              name: member.user.tag,
              icon_url: member.user.displayAvatarURL(),
            },
            fields: [
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
                name: 'Joined Previously',
                value: member.user.bot ? 'N/A' : hasJoinedBefore,
                inline: true,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      })
    }

    const fields: APIEmbedField[] = []

    if (isHoisting(member.displayName)) {
      await member.setNickname(clearHoistedNickname(member.displayName))
    }

    if (welcomeLog && welcomeLog.type === ChannelType.GuildText) {
      await welcomeLog.send({
        embeds: [
          {
            title: 'Member Joined',
            description: `**${member.user.tag}** has joined the server.`,
            fields,
          },
        ],
      })
    } else {
      console.error(`Could not find welcome log channel for ${member.guild.id}`)
    }
  }
}
