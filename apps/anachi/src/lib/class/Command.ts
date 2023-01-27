import {
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js'
import { CustomClient } from 'src/lib/discord.js/custom.client'

export interface ICommand {
  readonly name: string

  readonly description: string

  readonly subCommands?: SlashCommandSubcommandBuilder[]

  readonly subCommandGroups?: SlashCommandSubcommandGroupBuilder[]

  readonly permissions?: bigint

  readonly details: (details: SlashCommandBuilder) => SlashCommandBuilder

  _details: SlashCommandBuilder

  execute(interaction: CommandInteraction): Promise<any>
}

export type CommandCls = new (client: CustomClient) => ICommand

export abstract class Command implements ICommand {
  public abstract name: string

  public abstract description: string

  public abstract execute(interaction: CommandInteraction): Promise<any>

  public subCommands?: SlashCommandSubcommandBuilder[]

  public subCommandGroups?: SlashCommandSubcommandGroupBuilder[]

  public permissions?: bigint

  public details = (details: SlashCommandBuilder) => details

  _details = this.details(new SlashCommandBuilder())

  constructor(public client: CustomClient) {}
}
