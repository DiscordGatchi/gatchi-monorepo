import { CustomClient } from 'bot'
import { client } from 'src/client'

export class StarboardSystem {
  constructor(private readonly client: CustomClient) {}
}

export const stats = new StarboardSystem(client)
