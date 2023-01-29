import { Command } from 'bot'
import {
  BaseMessageOptions,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  Interaction,
  InteractionEditReplyOptions,
} from 'discord.js'

const TAKE_AMOUNT = 4

export class CardsCommand extends Command {
  name = 'cards'
  description = 'View your personal card collection'

  async execute(interaction: ChatInputCommandInteraction<'cached'>) {
    const { db } = this.client

    let currentPage = 0

    await interaction.deferReply()

    const totalOffenses = await db.cardPrint.count({
      where: {
        ownerId: interaction.user.id,
      },
    })

    const getComponents = (pageN: number): BaseMessageOptions['components'] => [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            customId: 'offenses:prev',
            emoji: '<:chevronleft:1067165608531214397>',
            disabled: pageN === 0,
            style: ButtonStyle.Primary,
          },
          {
            type: ComponentType.Button,
            customId: 'offenses:page-number',
            label: `${pageN + 1}/${Math.ceil(totalOffenses / TAKE_AMOUNT)}`,
            disabled: true,
            style: ButtonStyle.Secondary,
          },
          {
            type: ComponentType.Button,
            customId: 'offenses:next',
            emoji: '<:chevronright:1067165610292813854>',
            disabled: pageN === Math.ceil(totalOffenses / TAKE_AMOUNT) - 1,
            style: ButtonStyle.Primary,
          },
        ],
      },
    ]

    const getEditResponseOptions = async (
      pageN: number,
      noButtons = false,
    ): Promise<InteractionEditReplyOptions> => {
      const prints = await db.cardPrint.findMany({
        where: {
          ownerId: interaction.user.id,
        },
        take: TAKE_AMOUNT,
        skip: currentPage * TAKE_AMOUNT,
        include: {
          card: true,
        },
      })

      return {
        embeds: prints.map((print) => ({
          title: print.card.name,
          image: {
            url: `https://cache.kado.gg/cards/${encodeURIComponent(
              print.cin,
            )}.png`,
          },
        })) satisfies InteractionEditReplyOptions['embeds'],
        components: noButtons ? [] : getComponents(pageN),
      }
    }

    const filter = (i: Interaction) => i.user.id === interaction.user.id

    const collector = interaction.channel!.createMessageComponentCollector({
      filter,
      time: 300000,
    })

    collector.on('collect', async (i) => {
      if (i.customId === 'offenses:prev') {
        currentPage -= 1
      } else if (i.customId === 'offenses:next') {
        currentPage += 1
      }

      await i.update(await getEditResponseOptions(currentPage))
    })

    collector.once('end', async () => {
      await interaction.editReply(
        await getEditResponseOptions(currentPage, true),
      )
    })

    await interaction.editReply(await getEditResponseOptions(currentPage))
  }
}
