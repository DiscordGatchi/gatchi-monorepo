export * from 'src/utils/config'
export * from 'src/utils/discord-permissions'
export * from 'src/utils/generate-cin'
export * from 'src/utils/logging'
export * from 'src/utils/seeding'
export * from 'src/utils/anti-hoist'
export * from 'src/types'

export interface CustomProcessEnv {
  NODE_ENV: 'development' | 'production'

  DATABASE_URL: string

  AWS_REGION: string
  AWS_ENDPOINT: string
  AWS_BUCKET: string
  AWS_ACCESS_KEY_ID: string
  AWS_SECRET_ACCESS_KEY: string
  CUSTOM_DOMAIN: string | undefined

  KADO_CLIENT_ID: string
  KADO_CLIENT_TOKEN: string

  ANACHI_CLIENT_ID: string
  ANACHI_CLIENT_TOKEN: string
}

declare global {
  // override process.env with custom type for config
  namespace NodeJS {
    interface ProcessEnv extends CustomProcessEnv {}
  }

  interface out {
    log: (...args: any[]) => void
    info: (...args: any[]) => void
    warn: (...args: any[]) => void
    error: (...args: any[]) => void
    silly: (...args: any[]) => void
    debug: (...args: any[]) => void
  }

  const out: out
}

declare var out: out
