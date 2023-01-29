import { db } from 'src/db'

type GuildMemberInput = {
  id: string
  joinedAt: Date | null
  user: {
    username: string
    discriminator: string
    createdAt: Date
  }
}

export const tryGetOrCreateUser = (userDiscordId: string) =>
  db.user.upsert({
    where: {
      id: userDiscordId,
    },
    update: {},
    create: {
      id: userDiscordId,
    },
  })

export const tryGetOrCreateGuildMemberRef = async (
  member: GuildMemberInput,
) => {
  const user = await tryGetOrCreateUser(member.id)
  return db.guildMemberRef.upsert({
    where: {
      userId: user.id,
    },
    update: {
      name: member.user.username,
      discriminator: member.user.discriminator,
      joinedDiscordAt: member.user.createdAt,
      joinedGuildAt: member.joinedAt,
    },
    create: {
      userId: user.id,
      name: member.user.username,
      discriminator: member.user.discriminator,
      joinedDiscordAt: member.user.createdAt,
      joinedGuildAt: member.joinedAt,
    },
  })
}
