'use client'
import { Heading, Subheading } from '@/components/heading'
import Profile from '@/components/profile'
import { Revenue as RevenueComponent } from '@/components/revenue'
import Stat from '@/components/stat'
import { useGlobalContext } from '@/context/GlobalContext'
import { formatToUSD, getCurrentMonth } from '@/helpers/common'
import { RevenueRoutes } from '@/types'
import { useEffect } from 'react'

export default function Revenue({ params }: { params: { status: RevenueRoutes } }) {
  const { counts, gettingCounts, getCounts } = useGlobalContext()
  const pendingMonthlyTransactions = counts?.transactions?.month?.pending ?? 0
  const pendingMonthlyRewards = counts?.rewards?.month?.pending ?? 0
  const inactiveMonthlyUsers = counts?.users?.month?.inactive ?? 0

  useEffect(() => {
    getCounts()
  }, [])

  return (
    <>
      <div className="flex items-center justify-between gap-5">
        <Heading>Revenue</Heading>
        <Profile />
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
        <Subheading>Overview</Subheading>
      </div>

      <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          title="Total Revenue"
          value={formatToUSD(counts?.revenue?.all || 0)}
          change={`+${pendingMonthlyTransactions} pending ${pendingMonthlyTransactions == 1 ? 'txn' : 'txns'}`}
          description="this month"
          loading={gettingCounts}
        />
        <Stat
          title="YTD Revenue"
          value={formatToUSD(counts?.revenue?.year?.revenue || 0)}
          change={`+${pendingMonthlyRewards} pending ${pendingMonthlyRewards == 1 ? 'reward' : 'rewards'}`}
          description="this month"
          loading={gettingCounts}
        />
        <Stat
          title={`Month Revenue (${getCurrentMonth().name})`}
          value={formatToUSD(counts?.revenue?.month?.revenue || 0)}
          change={`+${inactiveMonthlyUsers} inactive ${inactiveMonthlyUsers == 1 ? 'user' : 'users'}`}
          description="this month"
          loading={gettingCounts}
        />
      </div>

      <RevenueComponent status={params.status} />
    </>
  )
}
