'use client'
import { Heading, Subheading } from '@/components/heading'
import Profile from '@/components/profile'
import Stat from '@/components/stat'
import { Transactions as TransactionsComponent } from '@/components/transactions'
import { useGlobalContext } from '@/context/GlobalContext'
import { TransactionRoutes } from '@/types'
import { useEffect } from 'react'

export default function Transactions({ params }: { params: { status: TransactionRoutes } }) {
  const { counts, gettingCounts, getCounts } = useGlobalContext()
  const allMonthlyTransactions = counts?.transactions?.month?.all ?? 0
  const pendingMonthlyTransactions = counts?.transactions?.month?.pending ?? 0
  const successfulMonthlyTransactions = counts?.transactions?.month?.successful ?? 0
  const failedMonthlyTransactions = counts?.transactions?.month?.failed ?? 0

  useEffect(() => {
    getCounts()
  }, [])

  return (
    <>
      <div className="flex items-center justify-between gap-5">
        <Heading>Transactions</Heading>
        <Profile />
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
        <Subheading>Overview</Subheading>
      </div>

      <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          title="All Transactions"
          value={counts?.transactions?.all || 0}
          change={`+${allMonthlyTransactions} ${allMonthlyTransactions == 1 ? 'txn' : 'txns'}`}
          description="this month"
          loading={gettingCounts}
        />
        <Stat
          title="Pending Transactions"
          value={counts?.transactions?.pending || 0}
          change={`+${pendingMonthlyTransactions} pending ${pendingMonthlyTransactions == 1 ? 'txn' : 'txns'}`}
          description="this month"
          loading={gettingCounts}
        />
        <Stat
          title="Successul Transactions"
          value={counts?.transactions?.successful || 0}
          change={`+${successfulMonthlyTransactions} successful ${successfulMonthlyTransactions == 1 ? 'txn' : 'txns'}`}
          description="this month"
          loading={gettingCounts}
        />
        <Stat
          title="Failed Transactions"
          value={counts?.transactions?.failed || 0}
          change={`+${failedMonthlyTransactions} failed ${failedMonthlyTransactions == 1 ? 'txn' : 'txns'}`}
          description="this month"
          loading={gettingCounts}
        />
      </div>

      <TransactionsComponent status={params.status} />
    </>
  )
}
