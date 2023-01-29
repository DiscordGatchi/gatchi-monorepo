/**
 * This is so stupid, but to get the logger to work, we need to import it like this, and then import it in index.ts
 * Yes, in that order. It wouldn't work otherwise :)))))) - Ken (Synqat)
 */

import { initLogger } from 'utils'

initLogger('Skia API')
