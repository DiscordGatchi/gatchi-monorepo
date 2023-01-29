import { PermissionsBitField } from 'discord.js'

export type PermissionFlag = keyof typeof PermissionsBitField.Flags

export const createPermissions = (permissions: PermissionFlag[]) => {
  const permissionsBitField = new PermissionsBitField()

  permissions.forEach((permission) => {
    permissionsBitField.add(permission)
  })

  return permissionsBitField.bitfield
}
