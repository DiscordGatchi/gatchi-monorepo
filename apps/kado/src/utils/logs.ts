import { Logger } from 'tslog'

export default new Logger({
  type: 'pretty',
  name: 'Kādo',
  prettyLogTemplate:
    '{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}\t[{{name}}]\t',
})
