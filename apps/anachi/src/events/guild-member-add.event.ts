import { AttachmentPayload, ChannelType, Events, GuildMember } from 'discord.js'
import { db, helpers, ModChannelType, SupportedStat } from 'db'
import { Event } from 'bot'
import {
  clearHoistedNickname,
  getConfigValue,
  getDateAsDiscordTimestamp,
  isHoisting,
} from 'utils'
import moment from 'moment'
import fetch from 'node-fetch'

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

    const res = await fetch(
      getConfigValue<string>('API_URL', true) + '/welcome',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatarUrl: member.user.displayAvatarURL({
            size: 128,
            extension: 'png',
          }),
          username: member.user.username,
          discriminator: member.user.discriminator,
        }),
      },
    )

    const welcomeImage = await res.buffer() // image/png

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

    if (isHoisting(member.displayName)) {
      await member.setNickname(clearHoistedNickname(member.displayName))
    }

    const welcomeImageCacheChannel = await member.guild.channels.fetch(
      '1069372625492643940',
    )

    if (!welcomeImageCacheChannel?.isTextBased()) {
      return
    }

    const sentMessage = await welcomeImageCacheChannel.send({
      files: [
        {
          name: `welcome-${member.user.id}.png`,
          attachment: welcomeImage,
        },
      ] satisfies AttachmentPayload[],
    })

    const imageUrl = sentMessage.attachments.first()?.url

    if (!imageUrl) {
      return
    }

    const getOrdinalSuffix = (i: number) => {
      const ordinal = (() => {
        const j = i % 10
        const k = i % 100
        if (j == 1 && k != 11) {
          return i + 'st'
        }
        if (j == 2 && k != 12) {
          return i + 'nd'
        }
        if (j == 3 && k != 13) {
          return i + 'rd'
        }
        return i + 'th'
      })()

      return `${i}${ordinal}`
    }

    if (welcomeLog && welcomeLog.type === ChannelType.GuildText) {
      await welcomeLog.send({
        content: `<a:GAAnyaWave:1067186590142709871> ${member}`,
        embeds: [
          {
            color: 0x2f3136,
            author: {
              name: `Welcome, ${member.user.username}!`,
              url: member.user.displayAvatarURL({ size: 32 }),
            },
            description:
              '・Check out our <#1066914761314410628>.\n' +
              '・Read up on <#1066914733682335764>.\n' +
              '・Help us get to know you by grabbing some <#1066914853182259211>.\n' +
              '・Come say hi in <#1064685222626594898>!',
            footer: {
              text: `You're the ${getOrdinalSuffix(
                member.guild.memberCount,
              )} member!`,
            },
            timestamp: new Date().toISOString(),
            image: {
              url: imageUrl,
            },
          },
        ],
      })
    } else {
      console.error(`Could not find welcome log channel for ${member.guild.id}`)
    }

    await Promise.all(
      (
        await db.statChannel.findMany()
      ).map(async (channelStat) => {
        const channel =
          member.guild.channels.cache.get(channelStat.channelId) ??
          (await member.guild.channels.fetch(channelStat.channelId))

        if (!channel) return

        switch (channelStat.stat) {
          case SupportedStat.MEMBER_COUNT:
            return await channel.setName(
              channelStat.name.replace(
                '{count}',
                member.guild.memberCount.toString(),
              ),
            )
        }
      }),
    )
  }
}
