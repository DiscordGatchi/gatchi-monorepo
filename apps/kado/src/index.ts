import { initLogger } from 'utils'
initLogger('Kādo')

import { client } from 'src/client'
import { getConfigValue } from 'utils'
import { dbInitCollection } from 'src/utils/db-init'
import { PRINT_COUNT_PER_CARD } from 'src/constants'

client
  .start(getConfigValue<string>('KADO_CLIENT_TOKEN', true))
  .then(async () => {
    await dbInitCollection('VTubers', PRINT_COUNT_PER_CARD)
  })
  .catch(console.error)
