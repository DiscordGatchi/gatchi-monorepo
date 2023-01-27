import { CommandInteraction } from 'discord.js'
import FormData from 'form-data'
import { Command, ICommand } from 'src/lib/decorators/command.decorator'
import { CustomClient } from 'src/lib/discord.js/custom.client'
import mime from 'mime-types'
import { CardOwnershipRef, DirtLevel } from 'db'
import fetch from 'node-fetch'
import { kebabCase } from 'lodash'
import { sqltag } from '@prisma/client/runtime'

const pretendCache = new Map<string | number, any>()

const getOrPutInPretendCache = async <T>(
  key: string | number,
  fn: () => Promise<T>,
) => {
  const cached = pretendCache.get(key)
  if (cached) return cached

  const value = await fn()
  pretendCache.set(key, value)
  return value
}

@Command({
  name: 'roll',
  description: 'joe',
})
export class RollCommand implements ICommand {
  constructor(readonly client: CustomClient) {}

  async execute(interaction: CommandInteraction): Promise<any> {
    const { db } = this.client
    await interaction.deferReply()

    const cardOwnershipRefs = (await db.$queryRaw(
      sqltag`SELECT "cardId" FROM "CardOwnershipRef" WHERE "CardOwnershipRef"."ownerId" is null ORDER BY RANDOM() LIMIT 1`,
    )) satisfies Array<Pick<CardOwnershipRef, 'cardId'>>

    const cardOwnershipRef = cardOwnershipRefs[0]

    if (!cardOwnershipRef) {
      throw new Error('No cards available')
    }

    const card = await db.card.findUnique({
      where: {
        id: cardOwnershipRef.cardId,
      },
    })

    if (!card) {
      return await interaction.editReply('No cards found')
    }

    const ref = await getOrPutInPretendCache(`ca-${card.refId}`, () =>
      db.cardRef.findUnique({
        where: {
          id: card.refId,
        },
      }),
    )

    if (!ref) {
      return await interaction.editReply('No card ref found')
    }

    const collection = await getOrPutInPretendCache(
      `co-${ref.collectionId}`,
      () =>
        db.collection.findUnique({
          where: {
            id: ref.collectionId,
          },
        }),
    )

    if (!collection) {
      return await interaction.editReply('No collection found')
    }

    const form = new FormData()

    const contentType = mime.contentType(ref.icon)

    if (!contentType) {
      return await interaction.editReply('No content type found for image')
    }

    form.append(
      'details',
      JSON.stringify({
        isSuperShiny: card.dirtLevel === DirtLevel.SHINY,
        isDirty: card.dirtLevel === DirtLevel.DIRTY,
        cin: card.cin,
        name: ref.name,
        icon: `${kebabCase(collection.name.toLowerCase())}/${ref.icon}`,
        powerLevel: card.powerLevel,
        totalPrintedCount: ref.totalPrintedCount,
        currentPrintNumber: card.currentPrintNumber,
      }),
    )

    const res = await fetch('https://api.kado.gg', {
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
