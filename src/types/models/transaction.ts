import { TransactionStatus } from '../enums/index'
import { IBank, IUser } from './user'

export type TransactionStatusType = `${TransactionStatus}`

export type ITransactionUser = {
  id: string
  firstName: string
  lastName: string
  banks: IBank[]
}

export type IAsset = {
  id: string
  name: string
  symbol: string
}

export type IPlatform = {
  id: string
  platform: string
  address: string
}

export interface ITransaction {
  _id: string
  key: string
  user: ITransactionUser
  asset: IAsset
  platform: IPlatform
  address: string
  quantity: number
  rate: string
  proof: string
  status: TransactionStatusType
  createdAt: Date
  dateApproved?: Date
}

export interface IUserTransaction {
  transaction: {
    _id: string
    key: string
    user: ITransactionUser
    asset: IAsset
    platform: IPlatform
    address: string
    quantity: number
    rate: string
    proof: string
    status: TransactionStatusType
    createdAt: Date
    dateApproved?: Date
  }
  user: IUser
}
