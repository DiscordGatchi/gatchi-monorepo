import { initLogger } from 'utils'
initLogger('Kādo')

import { client } from 'src/client'
import { getConfigValue } from 'utils'

client
  .start(getConfigValue<string>('KADO_CLIENT_TOKEN', true))
  .catch(console.error)
