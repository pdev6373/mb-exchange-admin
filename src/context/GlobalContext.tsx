'use client'
import { useApiRequest } from '@/hooks/useApiRequest'
import { SetType } from '@/types/common'
import { IAdmin } from '@/types/models/admin'
import { ICount } from '@/types/models/counts'
import { IReward } from '@/types/models/reward'
import { ITransaction } from '@/types/models/transaction'
import { IUser } from '@/types/models/user'
import { useSearchParams } from 'next/navigation'
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react'

export type OverviewType =
  | {
      parents: number
      caregivers: number
      all: number
      increment?: {
        parents: number
        caregivers: number
        all: number
      }
    }
  | undefined

export type SubscriptionOverviewType =
  | {
      totalMonthlySubscriptionRevenue: number
      parentMonthlySubscriptionRevenue: number
      caregiverMonthlySubscriptionRevenue: number
    }
  | undefined

export type UserType = {
  id: string
  createdAt: string
  email: string
  firstName: string
  lastName: string
  hasActiveSubscription: boolean
  isEnabled: boolean
  subscriptionType: string
  phoneNumber: string
  role: 'parent' | 'caregiver'
}

export type UsersType =
  | {
      totalCount: OverviewType
      users: UserType[]
      pagination: {
        hasPrevious: boolean
        hasNext: boolean
        totalPages: number
        currentPage: number
        numberOfCols: number
      }
    }
  | undefined

export type Sort = 'all-time' | 'last-week' | 'last-two-weeks' | 'last-month' | 'last-quarter'
type IsLoggedIn = 'yes' | 'no'
export type TableSort = 'ASC' | 'DESC'

type GlobalContextType = {
  users: IUser[]
  setUsers: SetType<IUser[]>
  admin: IAdmin | undefined
  setAdmin: SetType<IAdmin | undefined>
  counts: ICount | undefined
  setCounts: SetType<ICount | undefined>
  gettingCounts: boolean
  transactions: ITransaction[]
  setTransactions: SetType<ITransaction[]>
  rewards: IReward[]
  setRewards: SetType<IReward[]>

  getCounts: () => void

  usersSearch: string
  gettingUser: boolean
  gettingOverview: boolean
  gettingSubscriptionOverview: boolean
  rowsPerPage: number
  currentPage: number
  sort: Sort
  overview: OverviewType
  userCount: OverviewType
  subscriptionOverview: SubscriptionOverviewType
  login: () => void
  logout: () => void
  setSort: React.Dispatch<React.SetStateAction<Sort>>
  setUsersSearch: React.Dispatch<React.SetStateAction<string>>
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  setGettingUser: React.Dispatch<React.SetStateAction<boolean>>
  setOverview: React.Dispatch<React.SetStateAction<OverviewType>>
  setUserCount: React.Dispatch<React.SetStateAction<OverviewType>>
  setGettingOverview: React.Dispatch<React.SetStateAction<boolean>>
  setGettingSubscriptionOverview: React.Dispatch<React.SetStateAction<boolean>>
  setSubscriptionOverview: React.Dispatch<React.SetStateAction<SubscriptionOverviewType>>
  userSort: TableSort
  accessToken: string | undefined
  setAccessToken: React.Dispatch<React.SetStateAction<string | undefined>>
  setUserSort: React.Dispatch<React.SetStateAction<TableSort>>
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined)

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<IAdmin>()
  const [users, setUsers] = useState<IUser[]>([])
  const [counts, setCounts] = useState<ICount>()
  const [transactions, setTransactions] = useState<ITransaction[]>([])
  const [rewards, setRewards] = useState<IReward[]>([])

  const searchParams = useSearchParams()
  const [sort, setSort] = useState<Sort>('all-time')
  const [userCount, setUserCount] = useState<OverviewType>()
  const [usersSearch, setUsersSearch] = useState('')
  const [gettingUser, setGettingUser] = useState(true)
  const [overview, setOverview] = useState<OverviewType>()
  const [gettingOverview, setGettingOverview] = useState(true)
  const [gettingSubscriptionOverview, setGettingSubscriptionOverview] = useState(true)
  const [subscriptionOverview, setSubscriptionOverview] = useState<SubscriptionOverviewType>()
  const [rowsPerPage, setRowsPerPage] = useState<number>(parseInt(searchParams.get('rowsPerPage') || '10', 10))
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const [userSort, setUserSort] = useState<TableSort>('DESC')
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined)
  const { apiRequest: getAdmin } = useApiRequest<IAdmin>()
  const { apiRequest: getAllCounts, loading: gettingCounts } = useApiRequest<ICount>()

  useEffect(() => {
    ;(async () => {
      const response = await getAdmin({
        url: '/admin',
      })
      if (response.success) setAdmin(response.data)
    })()
  }, [])

  const getCounts = async () => {
    const response = await getAllCounts({
      url: '/admin/counts',
    })
    if (response.success) setCounts(response.data)
  }
  const login = () => {}
  const logout = () => {}

  return (
    <GlobalContext.Provider
      value={{
        users,
        setUsers,
        admin,
        setAdmin,
        counts,
        setCounts,
        gettingCounts,
        transactions,
        setTransactions,
        rewards,
        setRewards,

        gettingUser,
        setGettingUser,
        gettingOverview,
        overview,
        setGettingOverview,
        setOverview,
        setUsersSearch,
        usersSearch,
        setUserCount,
        userCount,
        setSubscriptionOverview,
        subscriptionOverview,
        gettingSubscriptionOverview,
        setGettingSubscriptionOverview,
        sort,
        setSort,
        rowsPerPage,
        setRowsPerPage,
        currentPage,
        setCurrentPage,
        login,
        logout,
        setUserSort,
        userSort,
        accessToken,
        setAccessToken,
        getCounts,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext)
  if (!context) throw new Error('useGlobalContext must be used within a GlobalProvider')

  return context
}
