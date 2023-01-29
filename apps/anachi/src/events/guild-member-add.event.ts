import { APIEmbedField, ChannelType, Events, GuildMember } from 'discord.js'
import { helpers } from 'db'
import { ModChannelType } from '@prisma/client'
import { Event } from 'bot'
import { clearHoistedNickname, isHoisting } from 'utils'

export class GuildMemberAddEvent extends Event(Events.GuildMemberAdd) {
  override async execute(member: GuildMember) {
    const ref = await helpers.user.tryGetOrCreateGuildMemberRef(member)
    const welcomeLog = await helpers.settings.getGuildChannelByType(
      member.guild,
      ModChannelType.WELCOME_LOGS,
    )

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
