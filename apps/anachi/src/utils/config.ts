export const getConfigValue = <V extends string | number | boolean = string>(
  key: string,
  throwIfMissing = false,
) => {
  const value = process.env[key]

  if (throwIfMissing && (value === '' || value === null)) {
    throw new Error(`Missing environment variable: ${key}`)
  }

  return value as V
}

export const getBooleanConfigValue = (key: string, throwIfMissing = false) => {
  const value = getConfigValue(key, throwIfMissing)

  if (value === 'true' || value === 'false') {
    return value === 'true'
  }

  throw new Error(`Invalid boolean value for environment variable: ${key}`)
}

export const getNumberConfigValue = (key: string, throwIfMissing = false) => {
  const value = getConfigValue(key, throwIfMissing)

  if (value !== null && !isNaN(Number(value))) {
    return Number(value)
  }

  throw new Error(`Invalid number value for environment variable: ${key}`)
}
