import { LoggerSet } from 'src/utils/logging'

export * from 'src/utils/general'
export * from 'src/utils/config'
export * from 'src/utils/discord-permissions'
export * from 'src/utils/generate-cin'
export * from 'src/utils/logging'
export * from 'src/utils/seeding'
export * from 'src/utils/anti-hoist'
export * from 'src/types'

interface out extends LoggerSet {
  sub: (name: string) => LoggerSet
}

declare global {
  const out: out
}

declare var out: out
