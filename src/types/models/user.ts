import { Gender } from '../enums/index'

export interface ICountry {
  code: string
  name: string
  flag: string
  currency: string
}

export interface IBank {
  bankName: string
  accountNumber: string
  accountName: string
  default: boolean
}

export interface IReferrer {
  id: string
  firstName?: string
  lastName?: string
}

export interface IUser {
  _id: string
  email: string
  firstName?: string
  lastName?: string
  referrer?: IReferrer
  referred?: number
  userName?: string
  referralCode?: string
  country?: ICountry
  phoneNumber?: string
  dateOfBirth?: Date
  gender?: Gender
  notificationsEnabled: boolean
  emailVerified: boolean
  registrationStatus: 'incomplete' | 'complete' | 'active'
  refreshToken?: string
  points: number
  banks: IBank[]
  createdAt: Date
  successfulTransactions?: number
  failedTransactions?: number
  pendingTransactions?: number
  totalTransactions?: number
  successfulRewards?: number
  pendingRewards?: number
  totalRewards?: number
}
