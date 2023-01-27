import { Event } from 'src/lib/class/Event'
import {
  Events,
  GuildAuditLogEntryCreateRawData,
} from 'src/lib/discord.js/events'

export class GuildAuditLogEntryCreateEvent extends Event(
  Events.GuildAuditLogEntryCreate,
) {
  override async execute(data: GuildAuditLogEntryCreateRawData) {
    console.log(data)
  }
}
