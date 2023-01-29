export const convertSeedFromString = (seed: string) => {
  let seedNumber = 0

  for (let i = 0; i < seed.length; i++) {
    seedNumber += seed.charCodeAt(i)
  }

  return seedNumber / (seed.length * 100)
}

export const generateSeededNumber = (
  seed: string | number,
  index: number,
  maxLength: number,
) => {
  const numbers = new Uint32Array(maxLength).map((_, i) => i)

  const _seed = typeof seed === 'string' ? convertSeedFromString(seed) : seed

  const random = (index: number) => {
    const x = Math.sin(index) * 10000 * _seed
    return x - Math.floor(x)
  }

  for (let i = 0; i < numbers.length; i++) {
    const j = Math.floor(random(i) * (i + 1))
    ;[numbers[i], numbers[j]] = [numbers[j], numbers[i]]
  }

  return numbers[index]
}
