import { Guild } from 'discord.js'
import { db } from 'src/db'
import { ModChannelType } from '@prisma/client'

export const tryGetOrCreate = (guild: Guild) =>
  db.guildSettings.upsert({
    where: {
      id: guild.id,
    },
    update: {},
    create: {
      id: guild.id,
    },
  })

export const getGuildChannelByType = async (
  guild: Guild,
  type: ModChannelType,
) => {
  const channel = await db.modChannel.findFirst({
    where: {
      type,
    },
  })

  if (!channel) {
    return null
  }

  return (
    guild.channels.cache.get(channel.channelId) ??
    (await guild.channels.fetch(channel.channelId))
  )
}
