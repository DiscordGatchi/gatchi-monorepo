export interface CustomProcessEnv {
  NODE_ENV: 'development' | 'production'

  DATABASE_URL: string

  PORT: string | undefined
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
}

const isConfigValueMissing = (value: string | undefined | null) =>
  value === '' || value === null || value === undefined

export const getConfigValue = <V extends string | number | boolean = string>(
  key: keyof CustomProcessEnv,
  throwIfMissing = false,
) => {
  const value = process.env[key]

  if (throwIfMissing && isConfigValueMissing(value)) {
    throw new Error(`Missing environment variable: ${key}`)
  }

  return value as V
}

export const getBooleanConfigValue = (
  key: keyof CustomProcessEnv,
  throwIfMissing = false,
  defaultValue?: boolean,
) => {
  const value = getConfigValue(key, throwIfMissing)

  if (isConfigValueMissing(value) && defaultValue !== undefined) {
    return defaultValue
  }

  if (value === 'true' || value === 'false') {
    return value === 'true'
  }

  throw new Error(`Invalid boolean value for environment variable: ${key}`)
}

export const getNumberConfigValue = (
  key: keyof CustomProcessEnv,
  throwIfMissing = false,
  defaultValue?: number,
) => {
  const value = getConfigValue(key, throwIfMissing)

  if (isConfigValueMissing(value) && defaultValue !== undefined) {
    return defaultValue
  }

  if (!isNaN(Number(value))) {
    return Number(value)
  }

  throw new Error(`Invalid number value for environment variable: ${key}`)
}
