export type IUserCount = {
  key: number
  all: number
  active: number
  inactive: number
}

export type ITransactionCount = {
  key: number
  all: number
  pending: number
  successful: number
  failed: number
}

export type IRewardCount = {
  key: number
  all: number
  pending: number
  successful: number
}

export interface IUsers {
  all: number
  active: number
  inactive: number
  month: IUserCount
  year: IUserCount
}

export interface ITransactions {
  all: number
  pending: number
  successful: number
  failed: number
  month: ITransactionCount
  year: ITransactionCount
}

export interface IRewards {
  all: number
  pending: number
  successful: number
  month: IRewardCount
  year: IRewardCount
}

export interface IYearRevenue {
  year: number
  revenue: number
}

export interface IMonthRevenue {
  month: string
  revenue: number
}

export interface IRevenue {
  all: number
  year?: IYearRevenue
  month?: IMonthRevenue
}

export interface ICount {
  users: IUsers
  transactions: ITransactions
  rewards: IRewards
  revenue: IRevenue
  createdAt?: Date
  updatedAt?: Date
}
