import { Command } from 'bot'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { createPermissions } from 'utils'
import { createCardIssue } from 'src/handlers/db/helpers/create'

export class IssueCommand extends Command {
  name = 'issue'
  description = 'Create a new card issue'

  permissions = createPermissions(['Administrator'])

  details = (details: SlashCommandBuilder) => {
    details
      .addIntegerOption((option) =>
        option
          .setName('card-id')
          .setDescription('The ID of the card to create an issue for')
          .setRequired(true),
      )
      .addIntegerOption((option) =>
        option
          .setName('print-count')
          .setDescription('The number of prints to make for for the issue')
          .setRequired(true),
      )
    return details
  }

  async execute(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply()

    const cardId = interaction.options.getInteger('card-id', true)
    const printCount = interaction.options.getInteger('print-count', true)

    const issue = await createCardIssue({ cardId, printCount })

    await interaction.editReply(
      `Created issue '${issue.id}' for card '${cardId}' with ${printCount} prints`,
    )
  }
}
