export interface IAsset {
  _id: string
  cryptoId: string
  name: string
  symbol: string
  image?: string
  ngnRate: number
  description?: string
  hasPlatforms?: boolean
  isActive?: boolean
  platformAddresses: {
    platform: string
    address: string
  }[]
}
