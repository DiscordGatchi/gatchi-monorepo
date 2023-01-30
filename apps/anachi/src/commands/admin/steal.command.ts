import {
  ChatInputCommandInteraction,
  Emoji,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from 'discord.js'
import { createPermissions } from 'utils'
import { Command } from 'bot'
import { db, SupportedStat } from 'db'
import fetch from 'node-fetch'

export class StealCommand extends Command {
  name = 'steal'
  description = 'Steal an emote.'
  permissions = createPermissions(['Administrator'])

  details = (details: SlashCommandBuilder) => {
    details
      .addStringOption((option) =>
        option
          .setName('name')
          .setDescription('The name of the emote.')
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName('emoji-or-url')
          .setDescription('The emoji or image to steal as an emote.'),
      )
      .addAttachmentOption((option) =>
        option.setName('image').setDescription('The image to use as an emote.'),
      )
    return details
  }

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return

    const name = interaction.options.getString('name', true)
    const emojiOrUrl = interaction.options.getString('emoji-or-url')
    const image = interaction.options.getAttachment('image')

    if (!emojiOrUrl && !image) {
      await interaction.reply({
        ephemeral: true,
        content: 'You need to provide an emoji or an image.',
      })
      return
    }

    const getEmojiUrlFromString = (emoji: string) => {
      const [animated, _, emojiId] = emoji.replace(/[<>]/g, '').split(':')
      return `https://cdn.discordapp.com/emojis/${emojiId}.${
        animated.startsWith('a') ? 'gif' : 'png'
      }?size=96&quality=lossless`
    }

    if (emojiOrUrl && !image) {
      try {
        let emote: Emoji
        if (emojiOrUrl.includes('http')) {
          const attachment = emojiOrUrl
          console.log(attachment)
          emote = await interaction.guild.emojis.create({
            name,
            reason: `Steal command by ${interaction.user.tag}`,
            attachment,
          })
        } else {
          const attachment = getEmojiUrlFromString(emojiOrUrl)
          console.log(attachment)
          emote = await interaction.guild.emojis.create({
            name,
            reason: `Steal command by ${interaction.user.tag}`,
            attachment,
          })
        }
        await interaction.reply({
          ephemeral: true,
          content: `Added '${name}' as ${emote}!`,
        })
      } catch (e) {
        await interaction.reply({
          ephemeral: true,
          content:
            'Something went wrong. Make sure the emote (or image url) is valid.',
          embeds: [
            {
              title: 'Error Message',
              image: {
                url: emojiOrUrl.startsWith('http')
                  ? emojiOrUrl
                  : getEmojiUrlFromString(emojiOrUrl),
              },
              description: JSON.stringify(e).slice(0, 1000),
            },
          ],
        })
      }
    }

    if (image && !emojiOrUrl) {
      await interaction.guild.emojis.create({
        name,
        reason: `Steal command by ${interaction.user.tag}`,
        attachment: image.url,
      })
    }
  }
}
