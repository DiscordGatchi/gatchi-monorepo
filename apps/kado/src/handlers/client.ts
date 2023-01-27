import { GatewayIntentBits } from 'discord.js'
import { CustomClient } from 'src/lib/discord.js/custom.client'

export const client = new CustomClient({ intents: [GatewayIntentBits.Guilds] })
