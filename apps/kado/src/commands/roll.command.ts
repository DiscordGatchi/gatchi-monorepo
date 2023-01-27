import { CommandInteraction } from 'discord.js'
import FormData from 'form-data'
import { Command, ICommand } from 'src/lib/decorators/command.decorator'
import { CustomClient } from 'src/lib/discord.js/custom.client'
import mime from 'mime-types'
import { DirtLevel } from 'db'
import fetch from 'node-fetch'
import { kebabCase } from 'lodash'
import { API_URL } from 'src/constants'
import { createCard } from 'src/handlers/db/helpers/create'
import { generateCIN } from 'src/utils/generate-cin'

@Command({
  name: 'roll',
  description: 'joe',
})
export class RollCommand implements ICommand {
  constructor(readonly client: CustomClient) {}

  async execute(interaction: CommandInteraction): Promise<any> {
    const { db } = this.client
    await interaction.deferReply()

    const randomCardRefId = 7195 /*Math.floor(
      Math.random() * (this.client.cardRefCount ?? 0),
    )*/

    const cardRef = await db.cardRef.findUnique({
      where: { id: randomCardRefId },
      include: {
        collection: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!cardRef) {
      return interaction.editReply({
        content: 'There was an internal error.',
      })
    }

    const currentPrintNumber = Math.floor(
      Math.random() * cardRef.totalPrintedCount,
    )

    const card = await createCard(cardRef.id, {
      cin: generateCIN(cardRef.id + '-' + currentPrintNumber, false),
      currentPrintNumber,
      powerLevel: 1,
      dirtLevel: DirtLevel.NORMAL,
    })

    if (!card) {
      return await interaction.editReply('There was an internal error.')
    }

    const form = new FormData()

    const contentType = mime.contentType(cardRef.icon)

    if (!contentType) {
      return await interaction.editReply('No content type found for image')
    }

    form.append(
      'details',
      JSON.stringify({
        isSuperShiny: card.dirtLevel === DirtLevel.SHINY,
        isDirty: card.dirtLevel === DirtLevel.DIRTY,
        cin: card.cin,
        name: cardRef.name,
        icon: `${kebabCase(cardRef.collection.name.toLowerCase())}/${
          cardRef.icon
        }`,
        powerLevel: card.powerLevel,
        totalPrintedCount: cardRef.totalPrintedCount,
        currentPrintNumber: card.currentPrintNumber,
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
