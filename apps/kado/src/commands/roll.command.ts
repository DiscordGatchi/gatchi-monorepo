import FormData from 'form-data'
import mime from 'mime-types'
import { DirtLevel } from 'db'
import fetch from 'node-fetch'
import { kebabCase } from 'lodash'
import { API_URL } from 'src/constants'
import { createCardPrint } from 'src/handlers/db/helpers/create'
import { generateSeededNumber } from 'utils'
import { generateCIN } from 'utils'
import { Command } from 'bot'
import { CommandInteraction } from 'discord.js'

export class RollCommand extends Command {
  name = 'draw'
  description = 'Draw a new card!'

  async execute(interaction: CommandInteraction) {
    const { db } = this.client
    await interaction.deferReply()

    const randomCardRefId = Math.floor(
      Math.random() * (this.client.cardCount ?? 0),
    )

    const card = await db.card.findUnique({
      where: { id: randomCardRefId },
      include: {
        collection: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!card) {
      return interaction.editReply({
        content: 'There was an internal error.',
      })
    }

    const cardIssues = await db.cardIssue.findMany({
      where: {
        cardId: card.id,
      },
      orderBy: {
        issueDate: 'desc',
      },
    })

    if (!cardIssues) {
      return await interaction.editReply('There was an internal error.')
    }

    const cardIssuesByDate = cardIssues.sort(
      (a, b) => b.issueDate.getTime() - a.issueDate.getTime(),
    )

    const latestIssue = cardIssuesByDate[0]
    const totalIssuePrints = cardIssuesByDate.reduce(
      (acc, issue) => acc + issue.printCount,
      0,
    )

    const printId = generateSeededNumber(
      card.seed,
      totalIssuePrints - latestIssue.printCount,
      latestIssue.printCount,
    )

    const cardPrint = await createCardPrint({
      cin: generateCIN(`${card.id}-${printId}-${card.collectionId}`, false),
      powerLevel: 1,
      printId,
      cardId: card.id,
      ownerId: interaction.user.id,
    })

    if (!cardPrint) {
      return await interaction.editReply('There was an internal error.')
    }

    const form = new FormData()

    const contentType = mime.contentType(card.icon)

    if (!contentType) {
      return await interaction.editReply('No content type found for image')
    }

    form.append(
      'details',
      JSON.stringify({
        isSuperShiny: cardPrint.dirtLevel === DirtLevel.SHINY,
        isDirty: cardPrint.dirtLevel === DirtLevel.DIRTY,
        cin: cardPrint.cin,
        name: card.name,
        icon: `${kebabCase(card.collection.name.toLowerCase())}/${card.icon}`,
        powerLevel: cardPrint.powerLevel,
        totalPrintedCount: totalIssuePrints,
        currentPrintNumber: cardPrint.printId,
      }),
    )

    const res = await fetch(API_URL, {
      method: 'POST',
      body: form,
    })

    const url = await res.text()

    await interaction.editReply({
      embeds: [
        {
          image: {
            url,
          },
        },
      ],
    })
  }
}
