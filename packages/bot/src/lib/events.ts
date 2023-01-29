import {
  Events as DiscordJSEvents,
  ClientEvents as DiscordJSClientEvents,
} from 'discord.js'
import { AuditLogEvent } from 'discord-api-types/v9'

export type GuildAuditLogEntryCreateChangesRawData<T> = {
  key: string
  new_value?: T
  old_value?: T
}

export type GuildAuditLogEntryCreateOptionsRawData = {
  id: string
  type: string
  count: string
  role_name: string
  message_id: string
  channel_id: string
  application_id: string
  members_removed: string
  delete_member_days: string
  auto_moderation_rule_name: string
  auto_moderation_rule_trigger_type: string
}

export type GuildAuditLogEntryCreateRawData<T = unknown> = {
  id: string
  action_type: AuditLogEvent
  reason?: string
  user_id?: string
  target_id?: string
  changes?: Array<GuildAuditLogEntryCreateChangesRawData<T>>
  options?: GuildAuditLogEntryCreateOptionsRawData
}

export const Events = {
  ...DiscordJSEvents,
  GuildAuditLogEntryCreate: 'guildAuditLogEntryCreate',
} as const

export type ClientEvents = DiscordJSClientEvents & {
  guildAuditLogEntryCreate: [GuildAuditLogEntryCreateRawData]
}
