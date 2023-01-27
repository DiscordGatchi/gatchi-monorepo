import { getCollectionData } from 'src/utils/getCollectionData'

export const vtubers = getCollectionData<{
  pc: string
  name: string
  pageUrl: string
  languages: string[]
  genres: string[]
  description: string
  icon: string
}>('vtubers')
