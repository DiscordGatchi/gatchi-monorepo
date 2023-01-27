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

export const tryGetOrCreateGuildMemberRef = (member: GuildMemberInput) =>
  db.guildMemberRef.upsert({
    where: {
      id: member.id,
    },
    update: {
      name: member.user.username,
      discriminator: member.user.discriminator,
      joinedDiscordAt: member.user.createdAt,
      joinedGuildAt: member.joinedAt,
    },
    create: {
      id: member.id,
      name: member.user.username,
      discriminator: member.user.discriminator,
      joinedDiscordAt: member.user.createdAt,
      joinedGuildAt: member.joinedAt,
    },
  })
