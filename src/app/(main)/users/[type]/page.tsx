'use client'
import { Heading, Subheading } from '@/components/heading'
import Profile from '@/components/profile'
import Stat from '@/components/stat'
import { Users as UsersComponent } from '@/components/users'
import { useGlobalContext } from '@/context/GlobalContext'
import { UserRoutes } from '@/types'
import { useEffect } from 'react'

export default function Users({ params }: { params: { type: UserRoutes } }) {
  const { counts, gettingCounts, getCounts } = useGlobalContext()
  const allMonthlyUsers = counts?.users?.month?.all ?? 0
  const activeMonthlyUsers = counts?.users?.month?.active ?? 0
  const inactiveMonthlyUsers = counts?.users?.month?.inactive ?? 0

  useEffect(() => {
    getCounts()
  }, [])

  return (
    <>
      <div className="flex items-center justify-between gap-5">
        <Heading>Users</Heading>
        <Profile />
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
        <Subheading>Overview</Subheading>
      </div>

      <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          title="Total Users"
          value={counts?.users?.all || 0}
          change={`+${allMonthlyUsers} ${allMonthlyUsers == 1 ? 'user' : 'users'}`}
          description="this month"
          loading={gettingCounts}
        />
        <Stat
          title="Active Users"
          value={counts?.users?.active || 0}
          change={`+${activeMonthlyUsers} active ${activeMonthlyUsers == 1 ? 'user' : 'users'}`}
          description="this month"
          loading={gettingCounts}
        />
        <Stat
          title="Inactive Users"
          value={counts?.users?.inactive || 0}
          change={`+${inactiveMonthlyUsers} inactive ${inactiveMonthlyUsers == 1 ? 'user' : 'users'}`}
          description="this month"
          loading={gettingCounts}
        />
      </div>

      <UsersComponent type={params.type} />
    </>
  )
}
