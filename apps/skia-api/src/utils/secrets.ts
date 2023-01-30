import { getConfigValue } from 'utils'

export const secrets = {
  endpoint: getConfigValue<string>('AWS_ENDPOINT', true),
  bucket: getConfigValue<string>('AWS_BUCKET', true),
  region: getConfigValue<string>('AWS_REGION', true),
  accessKeyId: getConfigValue<string>('AWS_ACCESS_KEY_ID', true),
  secretAccessKey: getConfigValue<string>('AWS_SECRET_ACCESS_KEY', true),
}
