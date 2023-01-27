import logger from 'src/utils/logs'
import { Collection } from 'discord.js'
import { CustomClient } from 'src/lib/discord.js/custom.client'
import { ICommand, ICommandClass } from 'src/lib/decorators/command.decorator'

export class CommandsRegister extends Collection<string, ICommand> {
  constructor(private readonly client: CustomClient) {
    super()
  }

  public register(Command: ICommandClass) {
    const command = new Command(this.client)
    this.set(command.name!, command)
    logger.info(`Registered command ${command.name}`)
  }
}
