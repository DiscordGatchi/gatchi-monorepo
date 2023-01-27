import { resolve } from 'node:path'
import { readFileSync } from 'fs-extra'

export const getCollectionData = <T>(collectionName: string): T[] =>
  readFileSync(
    resolve(
      __dirname,
      '..',
      'core',
      'data',
      'collections',
      collectionName,
      'data.json-records',
    ),
    'utf-8',
  )
    .split('\n')
    .map((line) => JSON.parse(line))
