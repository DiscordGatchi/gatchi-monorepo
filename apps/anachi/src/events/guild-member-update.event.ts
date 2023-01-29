import { Events, GuildMember } from 'discord.js'
import { CustomClient, Event } from 'bot'
import { clearHoistedNickname, isHoisting } from 'utils'
import { warnings } from 'src/lib/systems/warnings.system'

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
    await warnings.warn(
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
