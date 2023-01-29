import { client } from 'src/handlers/client'

import { PingCommand } from 'src/commands/ping.command'
import { DrawCommand } from 'src/commands/draw.command'
import { CardsCommand } from 'src/commands/cards.command'

import { IssueCommand } from 'src/commands/admin/issue.command'

import { ClientReadyEvent } from 'src/events/client-ready.event'
import { InteractionCreateEvent } from 'src/events/interaction-create.event'

// Commands - General
client.commands.register(PingCommand)
client.commands.register(DrawCommand)
client.commands.register(CardsCommand)

// Commands - Admin
client.commands.register(IssueCommand)

// Events
client.events.register(ClientReadyEvent)
client.events.register(InteractionCreateEvent)

export { client }
