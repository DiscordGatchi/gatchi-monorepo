import { Events, GuildMember } from 'discord.js'
import { Event } from 'src/lib/class/Event'
import { clearHoistedNickname, isHoisting } from 'src/utils/anti-hoist'
import { CustomClient } from 'src/lib/discord.js/custom.client'

const handleNicknameChange = async (
  client: CustomClient,
  oldMember: GuildMember,
  newMember: GuildMember,
) => {
  if (
    newMember.nickname &&
    oldMember.nickname !== newMember.nickname &&
    isHoisting(newMember.nickname)
  ) {
    await newMember.setNickname(clearHoistedNickname(newMember.nickname))
    const selfMember = newMember.guild.members.me!
    await client.warnings.warn(
      newMember,
      selfMember,
      'User attempted to hoist their nickname',
    )
  }
}

export class GuildMemberUpdateEvent extends Event(Events.GuildMemberUpdate) {
  override async execute(
    oldMember: GuildMember,
    newMember: GuildMember,
  ): Promise<void> {
    await handleNicknameChange(this.client, oldMember, newMember)
  }
}
