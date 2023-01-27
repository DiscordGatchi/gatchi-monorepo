import { getConfigValue } from 'src/utils/config'
import { client } from 'src/handlers/client'

import { RollCommand } from 'src/commands/roll.command'
import { PingCommand } from 'src/commands/ping.command'

import { ClientReadyEvent } from 'src/events/client-ready.event'
import { InteractionCreateEvent } from 'src/events/interaction-create.event'

client.commands.register(PingCommand)
client.commands.register(RollCommand)

client.events.register(ClientReadyEvent)
client.events.register(InteractionCreateEvent)

client.start(getConfigValue<string>('CLIENT_TOKEN', true)).catch(console.error)

export { client }
