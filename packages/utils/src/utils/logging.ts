import { Logger } from 'tslog'

const createLogger = (name: string) =>
  new Logger({
    type: 'pretty',
    name,
    prettyLogTemplate:
      '{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}\t[{{name}}]\t',
  })

export const initLogger = (name: string) => {
  const logger = createLogger(name)

  // @ts-ignore
  global.out = {}
  // @ts-ignore
  global.out.log = (...args: any[]) => logger.info(...args)
  // @ts-ignore
  global.out.info = (...args: any[]) => logger.info(...args)
  // @ts-ignore
  global.out.warn = (...args: any[]) => logger.warn(...args)
  // @ts-ignore
  global.out.error = (...args: any[]) => logger.error(...args)
  // @ts-ignore
  global.out.silly = (...args: any[]) => logger.silly(...args)
  // @ts-ignore
  global.out.debug = (...args: any[]) => logger.debug(...args)
}
