export const getSecret = async (secretId: string) => process.env[secretId]
