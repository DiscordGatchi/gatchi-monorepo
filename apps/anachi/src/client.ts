import { client } from 'src/handlers/client'

import { PingCommand } from 'src/commands/ping.command'
import { SetupCommand } from 'src/commands/admin/setup.command'
import { BanCommand } from 'src/commands/moderator/actions/ban.command'
import { UnbanCommand } from 'src/commands/moderator/actions/unban.command'
import { KickCommand } from 'src/commands/moderator/actions/kick.command'
import { TimeoutCommand } from 'src/commands/moderator/actions/timeout.command'
import { UntimeoutCommand } from 'src/commands/moderator/actions/untimeout.command'
import { WarnCommand } from 'src/commands/moderator/actions/warn.command'
import { ForgiveCommand } from 'src/commands/moderator/actions/forgive.command'
import { OffensesCommand } from 'src/commands/moderator/actions/offenses.command'

import { ClientReadyEvent } from 'src/events/client-ready.event'
import { InteractionCreateEvent } from 'src/events/interaction-create.event'
import { GuildMemberAddEvent } from 'src/events/guild-member-add.event'
import { GuildMemberUpdateEvent } from 'src/events/guild-member-update.event'

// Commands - General
client.commands.register(PingCommand)

// Commands - Admin
client.commands.register(SetupCommand)

// Commands - Moderator Actions
client.commands.register(BanCommand)
client.commands.register(WarnCommand)
client.commands.register(OffensesCommand)
client.commands.register(ForgiveCommand)
client.commands.register(UnbanCommand)
client.commands.register(KickCommand)
client.commands.register(TimeoutCommand)
client.commands.register(UntimeoutCommand)

// Events
client.events.register(ClientReadyEvent)
client.events.register(InteractionCreateEvent)
client.events.register(GuildMemberAddEvent)
client.events.register(GuildMemberUpdateEvent)

export { client }
