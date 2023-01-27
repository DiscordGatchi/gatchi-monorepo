import { getConfigValue } from 'src/utils/config'
import { client } from 'src/client'
import { REST, Routes, SlashCommandBuilder } from 'discord.js'

const getPluralEnd = (count: number) => (count === 1 ? '' : 's')

const rest = new REST({ version: '10' }).setToken(
  getConfigValue('CLIENT_TOKEN', true),
)

;(async () => {
  const commandDetails: object[] = []

  for (const command of client.commands.values()) {
    commandDetails.push(command._details.toJSON())
  }

  try {
    console.log(
      `Started refreshing ${
        commandDetails.length
      } application (/) command${getPluralEnd(commandDetails.length)}.`,
    )

    const data = (await rest.put(
      Routes.applicationCommands(getConfigValue('CLIENT_ID', true)),
      { body: commandDetails },
    )) as []

    if (!data) {
      throw new Error('No data returned')
    }

    console.log(
      `Successfully reloaded ${
        data.length
      } application (/) command${getPluralEnd(data.length)}.`,
    )

    client.destroy()
  } catch (error) {
    console.error(error)
  }
})()
