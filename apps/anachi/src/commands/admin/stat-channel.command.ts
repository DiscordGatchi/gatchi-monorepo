import {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from 'discord.js'
import { createPermissions } from 'utils'
import { Command } from 'bot'
import { db, SupportedStat } from 'db'

export class StatChannelCommand extends Command {
  name = 'stat-channel'
  description = 'Set a channel to record stats.'
  permissions = createPermissions(['Administrator'])

  subCommands = [
    new SlashCommandSubcommandBuilder()
      .setName('add')
      .setDescription('Add a stat channel.')
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('The channel to change the name of.')
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName('name')
          .setDescription(
            'The name to change the channel to. Add {count} to the name to include the stat.',
          )
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName('type')
          .setDescription('The type of stat to change.')
          .setRequired(true)
          .addChoices({
            name: 'Member Count',
            value: SupportedStat.MEMBER_COUNT,
          }),
      ),
    new SlashCommandSubcommandBuilder()
      .setName('remove')
      .setDescription('Remove a stat channel.')
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('The channel to change the name of.'),
      )
      .addStringOption((option) =>
        option
          .setName('channel-id')
          .setDescription('If you deleted the channel already.'),
      ),
    new SlashCommandSubcommandBuilder()
      .setName('view')
      .setDescription('View set stat channels.'),
  ]

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return

    const subCommand = interaction.options.getSubcommand()

    if (subCommand === 'view') {
      const statChannels = await db.statChannel.findMany({})
      return await interaction.reply({
        ephemeral: true,
        embeds: [
          {
            title: 'Stat Channels',
            fields: statChannels.map((statChannel) => ({
              name: statChannel.stat,
              value: `<#${statChannel.channelId}>\n\`${statChannel.name}\``,
            })),
          },
        ],
      })
    }

    const channel = interaction.options.getChannel('channel')
    const channelId = interaction.options.getString('channel-id')

    if (subCommand === 'remove') {
      if (!channel && !channelId) {
        return await interaction.reply({
          ephemeral: true,
          content: 'You must provide a channel or channel id.',
        })
      }

      await db.statChannel.delete({
        where: {
          channelId: channelId ? channelId : channel!.id,
        },
      })

      return await interaction.reply({
        ephemeral: true,
        content: 'The stat channel has been removed.',
      })
    }

    const name = interaction.options.getString('name', true)
    const stat = interaction.options.getString('type', true) as SupportedStat

    if (!name.includes('{count}')) {
      return await interaction.reply({
        ephemeral: true,
        content: "The name must include '{count}' in your new channel name.",
      })
    }

    if (!channel) return

    const channelStat = await db.statChannel.upsert({
      where: {
        channelId: channel.id,
      },
      update: {
        name,
        stat,
      },
      create: {
        channelId: channel.id,
        guildId: interaction.guild.id,
        name,
        stat,
      },
    })

    const guild = await this.client.guilds.fetch(interaction.guild.id)
    if (!guild) return

    const statChannel = await guild.channels.fetch(channelStat.channelId)
    if (!statChannel) return

    await statChannel.setName(channelStat.name.replace('{count}', '~0'))

    await interaction.reply({
      ephemeral: true,
      content: 'The new channel stat is setup.',
    })
  }
}
