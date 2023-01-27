import { CustomClient } from 'src/lib/discord.js/custom.client'
import { ClientEvents } from 'src/lib/discord.js/events'

export enum EventType {
  SINGLE = 'once',
  MULTIPLE = 'on',
}

export interface IEvent<EN extends keyof ClientEvents> {
  readonly name: EN
  readonly type: EventType

  execute(...eventArgs: ClientEvents[EN]): Promise<void>
}

abstract class _Event<N extends keyof ClientEvents> implements IEvent<N> {
  public abstract name: N
  public abstract type: EventType

  public abstract execute(...eventArgs: ClientEvents[N]): Promise<void>

  constructor(public client: CustomClient) {}
}

export type EventCls<N extends keyof ClientEvents> = new (
  client: CustomClient,
) => IEvent<N>

export const Event = <N extends keyof ClientEvents>(name: N) =>
  class extends _Event<typeof name> {
    public name = name
    public type: EventType = EventType.MULTIPLE

    public async execute(...eventArgs: ClientEvents[N]) {
      throw new Error('Method not implemented.')
    }
  }
