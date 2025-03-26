import { RewardStatus } from '../enums/index'

export type RewardStatusType = `${RewardStatus}`

export type IUser = {
  id: string
  firstName: string
  lastName: string
}

export interface IReward {
  _id: string
  key: string
  user: IUser
  amount: number
  status: RewardStatusType
  createdAt: Date
  dateApproved?: Date
}
