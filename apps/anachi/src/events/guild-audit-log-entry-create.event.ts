import {
  Event,
  Events,
  GuildAuditLogEntryCreateRawData,
} from 'bot'

export class GuildAuditLogEntryCreateEvent extends Event(
  Events.GuildAuditLogEntryCreate,
) {
  override async execute(data: GuildAuditLogEntryCreateRawData) {
    console.log(data)
  }
}
