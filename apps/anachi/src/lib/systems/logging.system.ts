import { CustomClient } from 'bot'
import { APIEmbed, ChannelType } from 'discord-api-types/v10'
import { helpers } from 'db'
import { Guild } from 'discord.js'
import {
  GuildMemberOffenseHistory,
  ModChannelType,
  ModServerAction,
} from '@prisma/client'
import { client } from 'src/client'

enum Colors {
  INFO = /* #71bef5 */ 0x71bef5,
  GOOD = /* #7bf186 */ 0x7bf186,
  WARN = /* #fff178 */ 0xfff178,
  ERROR = /* #f57272 */ 0xf57272,
}

const ActionColors = {
  [ModServerAction.BAN]: Colors.ERROR,
  [ModServerAction.UNBAN]: Colors.GOOD,
  [ModServerAction.KICK]: Colors.WARN,
  [ModServerAction.TIMEOUT]: Colors.WARN,
  [ModServerAction.UNTIMEOUT]: Colors.GOOD,
  [ModServerAction.MUTE]: Colors.WARN,
  [ModServerAction.UNMUTE]: Colors.GOOD,
  [ModServerAction.DEAFEN]: Colors.WARN,
  [ModServerAction.UNDEAFEN]: Colors.GOOD,
  [ModServerAction.DISCONNECT]: Colors.WARN,
  [ModServerAction.WARNING]: Colors.WARN,
  [ModServerAction.FORGIVE]: Colors.INFO,
}

export class LoggingSystem {
  constructor(private readonly client: CustomClient) {}

  private _actionToReadable(action: ModServerAction) {
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  private async _log(guild: Guild, isPublic: boolean, embed: APIEmbed) {
    const modLogs = await helpers.settings.getGuildChannelByType(
      guild,
      ModChannelType.MOD_ACTION_LOGS,
    )

    if (modLogs && modLogs.type === ChannelType.GuildText) {
      await modLogs.send({ embeds: [embed] })
    }

    if (isPublic) {
      const publicLogs = await helpers.settings.getGuildChannelByType(
        guild,
        ModChannelType.PUBLIC_ACTION_LOGS,
      )

      if (publicLogs && publicLogs.type === ChannelType.GuildText) {
        await publicLogs.send({ embeds: [embed] })
      }
    }

    return embed
  }

  getEmbed(
    title: string | undefined,
    action: ModServerAction,
    memberId: string,
    modId: string,
    offenseId: number,
    forgiven = false,
    reason = 'No reason provided',
  ): APIEmbed {
    return {
      title: `${forgiven ? `[FORGIVEN] ` : ''}${
        title ?? this._actionToReadable(action)
      }`,
      color: ActionColors[action],
      fields: [
        {
          name: 'User',
          value: `<@${memberId}> - (${memberId})`,
          inline: true,
        },
        {
          name: 'Moderator',
          value: `<@${modId}> - (${modId})`,
          inline: true,
        },
        {
          name: 'Reason',
          value: reason + (forgiven ? ' (CASE FORGIVEN)' : ''),
        },
      ],
      footer: {
        text: `Case #${offenseId}`,
      },
      timestamp: new Date().toISOString(),
    }
  }

  offenseToEmbedArgs(offense: GuildMemberOffenseHistory) {
    return [
      offense.action,
      offense.memberRefId,
      offense.moderatorId,
      offense.id,
      offense.forgiven,
      offense.reason,
    ] as const
  }

  log(
    guild: Guild,
    offense: GuildMemberOffenseHistory,
    { isPublic = true, title = '' } = {},
  ) {
    return this._log(
      guild,
      isPublic,
      this.getEmbed(title, ...this.offenseToEmbedArgs(offense)),
    )
  }
}

export const logging = new LoggingSystem(client)
