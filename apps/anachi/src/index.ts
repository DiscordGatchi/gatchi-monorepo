import { initLogger } from 'utils'
initLogger('Anachi')

import { client } from 'src/client'
import { getConfigValue } from 'utils'

client
  .start(getConfigValue<string>('ANACHI_CLIENT_TOKEN', true))
  .catch(console.error)
