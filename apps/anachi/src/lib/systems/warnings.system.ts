import { CustomClient } from 'bot'
import { db } from 'db'
import { helpers } from 'db'
import { GuildMember } from 'discord.js'
import { ModServerAction } from '@prisma/client'
import { client } from 'src/client'
import { logging } from 'src/lib/systems/logging.system'

export class WarningsSystem {
  constructor(private readonly client: CustomClient) {}

  async warn(user: GuildMember, mod: GuildMember, reason: string) {
    const dbMod = await helpers.user.tryGetOrCreateGuildMemberRef(mod)
    const dbMember = await helpers.user.tryGetOrCreateGuildMemberRef(user)
    const offense = await db.guildMemberOffenseHistory.create({
      data: {
        moderatorId: dbMod.id,
        memberRefId: dbMember.id,
        action: ModServerAction.WARNING,
        reason,
      },
    })
    await logging.log(user.guild, offense)
  }

  forgive(historyId: number) {
    return db.guildMemberOffenseHistory.delete({
      where: {
        id: historyId,
      },
    })
  }

  forgiveAllWarnings(memberRefId: string) {
    return db.guildMemberOffenseHistory.deleteMany({
      where: {
        memberRefId,
        action: ModServerAction.WARNING,
      },
    })
  }

  getWarnings(userId: string) {
    return db.guildMemberOffenseHistory.findMany({
      where: {
        memberRefId: userId,
        action: ModServerAction.WARNING,
      },
    })
  }

  getWarning(historyId: number) {
    return db.guildMemberOffenseHistory.findUnique({
      where: {
        id: historyId,
      },
    })
  }

  getWarningCount(userId: string) {
    return db.guildMemberOffenseHistory.count({
      where: {
        memberRefId: userId,
        action: ModServerAction.WARNING,
      },
    })
  }
}

export const warnings = new WarningsSystem(client)
