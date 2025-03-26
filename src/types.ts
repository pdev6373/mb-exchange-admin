export type Slug = 'admin-management' | 'notifications' | 'assets'

export type UserRoutes = 'all' | 'active' | 'inactive'
export type TransactionRoutes = 'pending' | 'all' | 'successful' | 'failed'
export type RewardRoutes = 'pending' | 'all' | 'successful'
export type RevenueRoutes = 'pending' | 'successful'

export type SettingsType = {
  children?: JSX.Element
  params: { tab: Slug }
}

export type UsersType = {
  children?: JSX.Element
  params: { role: UserRoutes; id: string }
}
