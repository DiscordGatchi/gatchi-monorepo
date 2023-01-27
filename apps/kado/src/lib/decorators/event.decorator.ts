import { Maybe } from 'src/utils/types'
import { CustomClient } from 'src/lib/discord.js/custom.client'
import { ClientEvents } from 'discord.js'

export interface EventInformation {
  readonly name: Exclude<string, keyof ClientEvents>
  readonly once?: boolean
}

export type IEvent = Maybe<EventInformation> & {
  client: CustomClient
  execute: (...args: any[]) => Promise<void>
}

export type IEventClass = new (...args: any[]) => IEvent

export function Event({ name, once }: EventInformation) {
  return function <T extends IEventClass>(constructor: T): IEventClass {
    return class extends constructor {
      name = name
      once = once

      constructor(...args: any[]) {
        super(...args)
      }
    }
  }
}
