export type Maybe<T extends Record<string, any>> = {
  [P in keyof T]?: T[P]
}
