import {
  APIEmbedField,
  ChannelType,
  EmbedBuilder,
  Events,
  User,
} from 'discord.js'
import { Event } from 'bot'
import { ModChannelType } from '@prisma/client'
import { helpers } from 'db'

const GUILD_ID = '1064685222043590666'

export class UserUpdateEvent extends Event(Events.UserUpdate) {
  override async execute(oldUser: User, newUser: User) {
    const guild =
      this.client.guilds.cache.get(GUILD_ID) ??
      (await this.client.guilds.fetch(GUILD_ID))

    const memberUpdateLogs = await helpers.settings.getGuildChannelByType(
      guild,
      ModChannelType.MEMBER_UPDATES_LOGS,
    )

    if (memberUpdateLogs && memberUpdateLogs.type === ChannelType.GuildText) {
      const fields: APIEmbedField[] = []

      if (oldUser.username !== newUser.username) {
        fields.push({
          name: 'Username',
          value: `${oldUser.username} -> ${newUser.username}`,
          inline: true,
        })
      }

      if (oldUser.discriminator !== newUser.discriminator) {
        fields.push({
          name: 'Discriminator',
          value: `${oldUser.discriminator} -> ${newUser.discriminator}`,
          inline: true,
        })
      }

      if (oldUser.avatar !== newUser.avatar) {
        fields.push({
          name: 'Avatar',
          value: `${oldUser.avatar} -> ${newUser.avatar}\n(Displayed Below)`,
          inline: true,
        })
      }

      if (oldUser.banner !== newUser.banner) {
        fields.push({
          name: 'Banner',
          value: `${oldUser.banner} -> ${newUser.banner}\n(Displayed Below)`,
          inline: true,
        })
      }

      const addAuthor = (embed: EmbedBuilder) =>
        embed.setAuthor({
          name: newUser.tag,
          iconURL: newUser.displayAvatarURL(),
        })

      const embeds: EmbedBuilder[] = [
        new EmbedBuilder()
          .setTitle('User Update')
          .setColor(0x71bef5)
          .setFields(fields)
          .setTimestamp(new Date()),
      ]

      if (oldUser.avatar !== newUser.avatar) {
        embeds.push(
          new EmbedBuilder()
            .setTitle('Old Avatar')
            .setColor(0x71bef5)
            .setImage(oldUser.displayAvatarURL({ size: 2048 })),
        )
        embeds.push(
          new EmbedBuilder()
            .setTitle('New Avatar')
            .setColor(0x71bef5)
            .setImage(newUser.displayAvatarURL({ size: 2048 })),
        )
      }

      if (oldUser.banner !== newUser.banner) {
        embeds.push(
          new EmbedBuilder()
            .setTitle('Old Banner')
            .setColor(0x71bef5)
            .setImage(oldUser.bannerURL({ size: 2048 }) ?? null),
        )
        embeds.push(
          new EmbedBuilder()
            .setTitle('New Banner')
            .setColor(0x71bef5)
            .setImage(newUser.bannerURL({ size: 2048 }) ?? null),
        )
      }

      await memberUpdateLogs.send({
        embeds: embeds.map(addAuthor),
      })
    }
  }
}
