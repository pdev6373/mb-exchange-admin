import { TransactionStatus } from '../enums/index'

export type TransactionStatusType = `${TransactionStatus}`

export type IUser = {
  id: string
  firstName: string
  lastName: string
}

export type IAsset = {
  id: string
  name: string
}

export type IPlatform = {
  id: string
  platform: string
  address: string
}

export interface ITransaction {
  _id: string
  key: string
  user: IUser
  asset: IAsset
  platform: IPlatform
  address: string
  quantity: number
  rate: number
  amount: number
  proof: string
  status: TransactionStatusType
  createdAt: Date
  dateApproved?: Date
}
