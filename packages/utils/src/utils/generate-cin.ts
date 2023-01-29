export const generateCIN = (uniqueInput: string, isSuperShiny: boolean) => {
  const yearAs2Digits = new Date().getFullYear().toString().slice(2)
  const monthAs2Digits = (new Date().getMonth() + 1).toString().padStart(2, '0')
  const uniqueInputAsHex = Buffer.from(uniqueInput).toString('hex')

  return `CIN-${yearAs2Digits}Y${monthAs2Digits}C${uniqueInputAsHex}${
    isSuperShiny ? '-S' : ''
  }`
}
