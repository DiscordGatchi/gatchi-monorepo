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
import { ForceWelcomeCommand } from 'anachi/src/commands/admin/force-welcome.command'
import { StatChannelCommand } from 'src/commands/admin/stat-channel.command'
import { StealCommand } from 'src/commands/admin/steal.command'

import { UserUpdateEvent } from 'src/events/user-update.event'
import { ClientReadyEvent } from 'src/events/client-ready.event'
import { MessageDeleteEvent } from 'src/events/message-delete.event'
import { MessageUpdateEvent } from 'src/events/message-update.event'
import { GuildMemberAddEvent } from 'src/events/guild-member-add.event'
import { InteractionCreateEvent } from 'src/events/interaction-create.event'
import { GuildMemberUpdateEvent } from 'src/events/guild-member-update.event'
import { GuildMemberRemoveEvent } from 'src/events/guild-member-remove.event'
import { GuildAuditLogEntryCreateEvent } from 'src/events/guild-audit-log-entry-create.event'

// Commands - General
client.commands.register(PingCommand)

// Commands - Admin
client.commands.register(SetupCommand)
client.commands.register(StealCommand)
client.commands.register(ForceWelcomeCommand)
client.commands.register(StatChannelCommand)

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
client.events.register(UserUpdateEvent)
client.events.register(ClientReadyEvent)
client.events.register(MessageUpdateEvent)
client.events.register(MessageDeleteEvent)
client.events.register(InteractionCreateEvent)
client.events.register(GuildMemberAddEvent)
client.events.register(GuildMemberUpdateEvent)
client.events.register(GuildMemberRemoveEvent)
client.events.register(GuildAuditLogEntryCreateEvent)

export { client }
