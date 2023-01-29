import { Logger } from 'tslog'

export interface LoggerSet {
  log: (...args: any[]) => void
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
  silly: (...args: any[]) => void
  debug: (...args: any[]) => void
}

const createLogger = (name: string) =>
  new Logger({
    type: 'pretty',
    name,
    prettyLogTemplate:
      '{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}\t[{{name}}]\t',
  })

export const initLogger = (name: string) => {
  const logger = createLogger(name)

  const getLoggerSet = (lgr: typeof logger): LoggerSet => ({
    log: (...args: any[]) => lgr.info(...args),
    info: (...args: any[]) => lgr.info(...args),
    warn: (...args: any[]) => lgr.warn(...args),
    error: (...args: any[]) => lgr.error(...args),
    silly: (...args: any[]) => lgr.silly(...args),
    debug: (...args: any[]) => lgr.debug(...args),
  })

  // @ts-ignore
  global.out = {
    ...getLoggerSet(logger),
    sub: (name: string) =>
      getLoggerSet(logger.getSubLogger({ type: 'pretty', name })),
  }

  // @ts-ignore
  globalThis.out = global.out
}
