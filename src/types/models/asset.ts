export interface IAsset {
  _id: string
  cryptoId: string
  name: string
  symbol: string
  image?: string
  rate: number
  vipRate?: number
  description?: string
  hasPlatforms?: boolean
  isActive?: boolean
  platformAddresses: {
    platform: string
    address: string
  }[]
}
