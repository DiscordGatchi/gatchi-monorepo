export const passValue =
  <T>(value: T) =>
  () =>
    value

export const promiseAsBoolean = (promise: Promise<any>) =>
  promise.then(passValue(true)).catch(passValue(false))

export const getDateAsDiscordTimestamp = (date: Date, relative?: boolean) =>
  `<t:${Math.floor(date.getTime() / 1000)}${relative ? ':R' : ''}>`
