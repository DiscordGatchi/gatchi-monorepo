import { createPermissions } from 'src/utils/discord-permissions'
import { Command } from 'src/lib/class/Command'
import {
  BaseMessageOptions,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  Interaction,
  InteractionEditReplyOptions,
  SlashCommandBuilder,
} from 'discord.js'
import { ModServerAction } from '@prisma/client'

const TAKE_AMOUNT = 4

export class OffensesCommand extends Command {
  name = 'offenses'
  description = '/offenses @User'
  permissions = createPermissions(['ViewAuditLog'])

  details = (details: SlashCommandBuilder) => {
    details
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('The user to display offenses for')
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName('type')
          .setDescription('The type of offenses to display')
          .addChoices({
            name: 'All (default)',
            value: '*',
          })
          .addChoices({
            name: 'Forgiven Only',
            value: 'forgiven',
          })
          .addChoices({
            name: 'Un* (Unban, Unmute, etc.)',
            value: [
              ModServerAction.UNBAN,
              ModServerAction.UNMUTE,
              ModServerAction.UNDEAFEN,
              ModServerAction.UNTIMEOUT,
            ].join(','),
          })
          .addChoices({
            name: 'Bans',
            value: ModServerAction.BAN,
          })
          .addChoices({
            name: 'Warnings',
            value: ModServerAction.WARNING,
          })
          .addChoices({
            name: 'Mutes',
            value: ModServerAction.MUTE,
          })
          .addChoices({
            name: 'Kicks',
            value: ModServerAction.KICK,
          })
          .addChoices({
            name: 'Timeouts',
            value: ModServerAction.TIMEOUT,
          })
          .addChoices({
            name: 'Deafens',
            value: ModServerAction.DEAFEN,
          })
          .addChoices({
            name: 'Forgives',
            value: ModServerAction.FORGIVE,
          }),
      )
      .addBooleanOption((option) =>
        option
          .setName('show-forgiven')
          .setDescription('Include forgiven warnings in results'),
      )

    return details
  }

  async execute(interaction: ChatInputCommandInteraction<'cached'>) {
    const { db } = this.client
    const { options } = interaction

    let currentPage = 0

    await interaction.deferReply({ ephemeral: true })

    const targetUser = options.getUser('user', true)
    const types = (options.getString('type') ?? '*').split(',') as
      | ModServerAction[]
      | ['*']
      | ['forgiven']
    const showForgiven = options.getBoolean('show-forgiven', false) ?? undefined

    const getArgs = () => {
      const action =
        types[0] === '*' ? undefined : { in: types as ModServerAction[] }

      const forgiven = types[0] === 'forgiven' ? true : showForgiven

      return {
        forgiven,
        action: forgiven ? undefined : action,
      } as const
    }

    const totalOffenses = await db.guildMemberOffenseHistory.count({
      where: {
        memberRefId: targetUser.id,
        ...getArgs(),
      },
      orderBy: {
        updatedAt: 'desc',
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
      const warnings = await db.guildMemberOffenseHistory.findMany({
        where: {
          memberRefId: targetUser.id,
          ...getArgs(),
        },
        take: TAKE_AMOUNT,
        skip: currentPage * TAKE_AMOUNT,
        orderBy: {
          updatedAt: 'desc',
        },
      })

      return {
        content: `**${targetUser.tag}** has **${totalOffenses}** total offense${
          totalOffenses === 1 ? '' : 's'
        } for: \`${types.join(',')}\``,
        embeds: warnings.map((warning) =>
          this.client.logging.getEmbed(
            undefined,
            ...this.client.logging.offenseToEmbedArgs(warning),
          ),
        ),
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
