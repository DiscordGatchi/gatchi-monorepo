import { APIEmbedField, EmbedBuilder, Events, Message } from 'discord.js'
import { Event } from 'bot'
import { helpers } from 'db'
import { ModChannelType } from '@prisma/client'

export class MessageDeleteEvent extends Event(Events.MessageDelete) {
  override async execute(message: Message) {
    if (message.author.bot) return
    if (!message.guild) return
    if (!message.member) return

    const messageLogs = await helpers.settings.getGuildChannelByType(
      message.guild,
      ModChannelType.MESSAGE_LOGS,
    )

    if (messageLogs && messageLogs.isTextBased()) {
      const embeds: EmbedBuilder[] = []

      const fields: APIEmbedField[] = []

      fields.push({
        name: 'Channel',
        value: message.channel.toString(),
        inline: true,
      })

      if (message.attachments.size > 0) {
        fields.push({
          name: 'Attachments',
          value: `${message.attachments.size} attachment${
            message.attachments.size === 1 ? '' : 's'
          }`,
          inline: true,
        })
      }

      embeds.push(
        new EmbedBuilder()
          .setColor(message.member.displayColor)
          .setTitle('Message Deleted')
          .setAuthor({
            url: message.url,
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL(),
          })
          .setDescription(message.content ?? 'No message content.')
          .addFields(fields)
          .setTimestamp(message.createdAt),
      )

      await messageLogs.send({
        embeds,
        files: message.attachments.map((attachment) => attachment.url),
      })
    }
  }
}
