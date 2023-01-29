import { Events, Message } from 'discord.js'
import { Event } from 'bot'

export class MessageUpdateEvent extends Event(Events.MessageUpdate) {
  override async execute(oldMessage: Message, newMessage: Message) {
    if (oldMessage.author.bot || newMessage.author.bot) return
    if (!oldMessage.guild || !newMessage.guild) return
    if (!oldMessage.member || !newMessage.member) return

    console.log('MessageUpdateEvent', oldMessage.content, newMessage.content)
  }
}
