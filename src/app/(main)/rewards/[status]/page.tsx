'use client'
import { Heading, Subheading } from '@/components/heading'
import Profile from '@/components/profile'
import { Rewards as RewardsComponent } from '@/components/rewards'
import Stat from '@/components/stat'
import { useGlobalContext } from '@/context/GlobalContext'
import { RewardRoutes } from '@/types'
import { useEffect } from 'react'

export default function Rewards({ params }: { params: { status: RewardRoutes } }) {
  const { counts, gettingCounts, getCounts } = useGlobalContext()
  const allMonthlyRewards = counts?.rewards?.month?.all ?? 0
  const pendingMonthlyRewards = counts?.rewards?.month?.pending ?? 0
  const successfulMonthlyRewards = counts?.rewards?.month?.successful ?? 0

  useEffect(() => {
    getCounts()
  }, [])

  return (
    <>
      <div className="flex items-center justify-between gap-5">
        <Heading>Rewards</Heading>
        <Profile />
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
        <Subheading>Overview</Subheading>
      </div>

      <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          title="All Rewards"
          value={counts?.rewards?.all || 0}
          change={`+${allMonthlyRewards} ${allMonthlyRewards == 1 ? 'reward' : 'rewards'}`}
          description="this month"
          loading={gettingCounts}
        />
        <Stat
          title="Pending Rewards"
          value={counts?.rewards?.pending || 0}
          change={`+${pendingMonthlyRewards} pending ${pendingMonthlyRewards == 1 ? 'reward' : 'rewards'}`}
          description="this month"
          loading={gettingCounts}
        />
        <Stat
          title="Successul Rewards"
          value={counts?.rewards?.successful || 0}
          change={`+${successfulMonthlyRewards} successful ${successfulMonthlyRewards == 1 ? 'reward' : 'rewards'}`}
          description="this month"
          loading={gettingCounts}
        />
      </div>

      <RewardsComponent status={params.status} />
    </>
  )
}
