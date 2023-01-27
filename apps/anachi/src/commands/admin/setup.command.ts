import {
  APIEmbedField,
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js'
import { createPermissions } from 'src/utils/discord-permissions'
import { Command } from 'src/lib/class/Command'
import { ModChannelType, ModRoleType } from 'db'

const getChannelTypeFromSubCommand = (subCommand: string) => {
  switch (subCommand) {
    case 'welcome':
      return ModChannelType.WELCOME_LOGS
    case 'leave':
      return ModChannelType.LEAVE_LOGS
    case 'mod-chat':
      return ModChannelType.MOD_CHAT
    case 'mod-logs':
      return ModChannelType.MOD_ACTION_LOGS
    case 'ticket-logs':
      return ModChannelType.TICKET_LOGS
    case 'public-mod-logs':
      return ModChannelType.PUBLIC_ACTION_LOGS
    case 'ticket-requests':
      return ModChannelType.TICKET_REQUESTS
    default:
      return null
  }
}

const getRoleTypeFromSubCommand = (subCommand: string) => {
  switch (subCommand) {
    case 'mod':
      return ModRoleType.MOD
    case 'admin':
      return ModRoleType.ADMIN
    case 'trial-mod':
      return ModRoleType.TRIAL_MOD
    case 'owner':
      return ModRoleType.OWNER
    default:
      return null
  }
}

const toTitleCase = (str: string, splitter: '-' | '_' | '.') =>
  str
    .split(splitter)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

export class SetupCommand extends Command {
  name = 'setup'
  description = 'Guild setup command.'
  permissions = createPermissions(['Administrator'])

  subCommands = [
    new SlashCommandSubcommandBuilder()
      .setName('view')
      .setDescription('View your guild settings setup.'),
  ]

  subCommandGroups = [
    new SlashCommandSubcommandGroupBuilder()
      .setName('channels')
      .setDescription('Setup channels.')
      .addSubcommand(
        new SlashCommandSubcommandBuilder()
          .setName('welcome')
          .setDescription('Setup the welcome channel for the server.')
          .addChannelOption((option) =>
            option
              .setName('channel')
              .setDescription('Passing nothing will unset the channel.'),
          ),
      )
      .addSubcommand(
        new SlashCommandSubcommandBuilder()
          .setName('leave')
          .setDescription('Setup the leave channel for the server.')
          .addChannelOption((option) =>
            option
              .setName('channel')
              .setDescription('Passing nothing will unset the channel.'),
          ),
      )
      .addSubcommand(
        new SlashCommandSubcommandBuilder()
          .setName('mod-chat')
          .setDescription('Setup the mod chat channel for the server.')
          .addChannelOption((option) =>
            option
              .setName('channel')
              .setDescription('Passing nothing will unset the channel.'),
          ),
      )
      .addSubcommand(
        new SlashCommandSubcommandBuilder()
          .setName('mod-logs')
          .setDescription('Setup the mod logs channel for the server.')
          .addChannelOption((option) =>
            option
              .setName('channel')
              .setDescription('Passing nothing will unset the channel.'),
          ),
      )
      .addSubcommand(
        new SlashCommandSubcommandBuilder()
          .setName('ticket-logs')
          .setDescription('Setup the ticket logs channel for the server.')
          .addChannelOption((option) =>
            option
              .setName('channel')
              .setDescription('Passing nothing will unset the channel.'),
          ),
      )
      .addSubcommand(
        new SlashCommandSubcommandBuilder()
          .setName('public-mod-logs')
          .setDescription('Setup the public mod logs channel for the server.')
          .addChannelOption((option) =>
            option
              .setName('channel')
              .setDescription('Passing nothing will unset the channel.'),
          ),
      )
      .addSubcommand(
        new SlashCommandSubcommandBuilder()
          .setName('ticket-requests')
          .setDescription('Setup the ticket requests channel for the server.')
          .addChannelOption((option) =>
            option
              .setName('channel')
              .setDescription('Passing nothing will unset the channel.'),
          ),
      ),
    new SlashCommandSubcommandGroupBuilder()
      .setName('roles')
      .setDescription('Setup roles.')
      .addSubcommand(
        new SlashCommandSubcommandBuilder()
          .setName('mod')
          .setDescription('Setup the mod role for the server.')
          .addRoleOption((option) =>
            option
              .setName('role')
              .setDescription('Passing nothing will unset the role.'),
          ),
      )
      .addSubcommand(
        new SlashCommandSubcommandBuilder()
          .setName('admin')
          .setDescription('Setup the admin role for the server.')
          .addRoleOption((option) =>
            option
              .setName('role')
              .setDescription('Passing nothing will unset the role.'),
          ),
      )
      .addSubcommand(
        new SlashCommandSubcommandBuilder()
          .setName('trial-mod')
          .setDescription('Setup the trial mod role for the server.')
          .addRoleOption((option) =>
            option
              .setName('role')
              .setDescription('Passing nothing will unset the role.'),
          ),
      )
      .addSubcommand(
        new SlashCommandSubcommandBuilder()
          .setName('owner')
          .setDescription('Setup the owner role for the server.')
          .addRoleOption((option) =>
            option
              .setName('role')
              .setDescription('Passing nothing will unset the role.'),
          ),
      ),
  ]

  async execute(interaction: ChatInputCommandInteraction) {
    const { db } = this.client
    const { guild } = interaction

    if (!guild) {
      return
    }

    const subCommand = interaction.options.getSubcommand()
    const subCommandGroup = interaction.options.getSubcommandGroup()

    if (subCommand === 'view') {
      const settings = await db.guildSettings.findUnique({
        where: { id: guild.id },
        select: { modChannels: true, modRoles: true },
      })

      if (!settings) {
        return interaction.reply({
          content: 'No settings',
          ephemeral: true,
        })
      }

      const fields: APIEmbedField[] = []

      if (settings.modChannels) {
        fields.push({
          name: 'Channels',
          value: settings.modChannels
            .map((channel) => {
              return `**${toTitleCase(channel.type, '_')}**: <#${
                channel.channelId
              }>`
            })
            .join('\n'),
        })
      }

      if (settings.modRoles) {
        fields.push({
          name: 'Roles',
          value: settings.modRoles
            .map((role) => {
              return `**${toTitleCase(role.type, '_')}**: <@&${role.roleId}>`
            })
            .join('\n'),
        })
      }

      return interaction.reply({
        embeds: [
          {
            title: `${guild.name} settings`,
            fields,
          },
        ],
      })
    }

    if (subCommandGroup === 'channels') {
      const channel = interaction.options.get('channel')
      const subCommand = interaction.options.getSubcommand()
      const channelType = getChannelTypeFromSubCommand(subCommand)

      if (!channelType) {
        return interaction.reply({
          content: 'Invalid subcommand.',
          ephemeral: true,
        })
      }

      if (!channel || !channel.channel) {
        await db.guildSettings.update({
          where: {
            id: guild.id,
          },
          data: {
            modChannels: {
              deleteMany: {
                type: channelType,
              },
            },
          },
        })

        return interaction.reply({
          content: 'Channel unset.',
          ephemeral: true,
        })
      }

      const existingModChannel = await db.modChannel.findFirst({
        where: {
          type: channelType,
        },
      })

      await db.guildSettings.upsert({
        where: {
          id: guild.id,
        },
        update: {
          modChannels: existingModChannel
            ? {
                update: {
                  where: {
                    id: existingModChannel.id,
                  },
                  data: {
                    channelId: channel.channel.id,
                  },
                },
              }
            : {
                create: {
                  type: channelType,
                  channelId: channel.channel.id,
                },
              },
        },
        create: {
          id: guild.id,
          modChannels: {
            create: {
              type: channelType,
              channelId: channel.channel.id,
            },
          },
        },
      })

      return interaction.reply({
        content: 'Channel set.',
      })
    }

    if (subCommandGroup === 'roles') {
      const role = interaction.options.get('role')
      const subCommand = interaction.options.getSubcommand()
      const roleType = getRoleTypeFromSubCommand(subCommand)

      if (!roleType) {
        return interaction.reply({
          content: 'Invalid subcommand.',
          ephemeral: true,
        })
      }

      if (!role || !role.role) {
        await db.guildSettings.update({
          where: {
            id: guild.id,
          },
          data: {
            modRoles: {
              deleteMany: {
                type: roleType,
              },
            },
          },
        })

        return interaction.reply({
          content: 'Role unset.',
          ephemeral: true,
        })
      }

      const existingModRole = await db.modRole.findFirst({
        where: {
          type: roleType,
        },
      })

      await db.guildSettings.upsert({
        where: {
          id: guild.id,
        },
        update: {
          modRoles: existingModRole
            ? {
                update: {
                  where: {
                    id: existingModRole.id,
                  },
                  data: {
                    roleId: role.role.id,
                  },
                },
              }
            : {
                create: {
                  type: roleType,
                  roleId: role.role.id,
                },
              },
        },
        create: {
          id: guild.id,
          modRoles: {
            create: {
              type: roleType,
              roleId: role.role.id,
            },
          },
        },
      })

      return interaction.reply({
        content: 'Role set.',
      })
    }
  }
}
