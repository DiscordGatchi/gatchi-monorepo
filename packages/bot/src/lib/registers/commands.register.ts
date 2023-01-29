import { Collection } from 'discord.js'
import { CustomClient } from 'src/lib/custom.client'
import { CommandCls, ICommand } from 'src/lib/class/Command'

export class CommandsRegister extends Collection<string, ICommand> {
  constructor(private readonly client: CustomClient) {
    super()
  }

  public register<C extends CommandCls>(Command: C) {
    const command = new Command(this.client)

    const details = command.details(command._details)

    details.setName(command.name)
    details.setDescription(command.description)

    if (command.subCommands) {
      command.subCommands.forEach((subCommand) => {
        details.addSubcommand(subCommand)
      })
    }

    if (command.subCommandGroups) {
      command.subCommandGroups.forEach((subCommandGroup) => {
        details.addSubcommandGroup(subCommandGroup)
      })
    }

    if (command.permissions) {
      details.setDefaultMemberPermissions(command.permissions)
    }

    this.set(command.name, command)

    out.info(`Registered command ${command.name}`)
  }
}
