import 'src/logging'
import 'src/api/font'

import { server } from 'src/server'
import { getNumberConfigValue } from 'utils'

const port = getNumberConfigValue('PORT', false, 8080)

out.info(`Starting server on port ${port}...`)

server.listen(
  {
    port,
    host: '0.0.0.0',
  },
  (err, address) => {
    if (err) {
      out.error(err)
      process.exit(1)
    }
    out.info(`Server listening at ${address}!`)
  },
)
