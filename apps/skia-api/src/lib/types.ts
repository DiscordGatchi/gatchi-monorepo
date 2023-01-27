export interface CardDetails {
  cin: string
  name: string
  icon: string
  currentPrintNumber: number
  totalPrintedCount: number
  powerLevel: number
  isDirty: boolean
  isSuperShiny: boolean
}

export type Maybe<T extends Record<string, any> | any> = T extends Record<
  string,
  any
>
  ? { [K in keyof T]?: Maybe<T[K]> }
  : T | null | undefined

export type NotUndefined<T> = T extends undefined | null ? never : T
