import { client } from 'src/client'
import { getConfigValue } from 'src/utils/config'

client.start(getConfigValue<string>('CLIENT_TOKEN', true)).catch(console.error)
