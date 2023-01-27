import { CommandInteraction, SlashCommandBuilder } from 'discord.js'
import { client } from 'src/handlers/client'
import { Maybe } from 'src/utils/types'
import { CustomClient } from 'src/lib/discord.js/custom.client'

export interface CommandInformation {
  readonly name: string

  readonly description: string
}

export type ICommand = Maybe<CommandInformation> & {
  client: CustomClient
  details?: SlashCommandBuilder

  // TODO: add a response type that gets automatically handled by the execute method
  execute: (interaction: CommandInteraction) => Promise<void>
}

export type ICommandClass = new (...args: any[]) => ICommand

export function Command({ name, description }: CommandInformation) {
  return function <T extends ICommandClass>(constructor: T): ICommandClass {
    return class extends constructor {
      name = name
      description = description

      constructor(...args: any[]) {
        super(client)
      }
      private readonly _details = new SlashCommandBuilder()
        .setName(name)
        .setDescription(description)
    }
  }
}
