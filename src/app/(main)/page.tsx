'use client'
import { Badge } from '@/components/badge'
import { Heading, Subheading } from '@/components/heading'
import LoadingTable from '@/components/loader/table'
import Profile from '@/components/profile'
import Stat from '@/components/stat'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { useGlobalContext } from '@/context/GlobalContext'
import { formatToUSD, getCurrentMonth } from '@/helpers/common'
import { useApiRequest } from '@/hooks/useApiRequest'
import { IReward } from '@/types/models/reward'
import { ITransaction } from '@/types/models/transaction'
import { format } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

const currentMonth = getCurrentMonth()

export default function Home() {
  const { admin, counts, gettingCounts, getCounts, transactions, setTransactions, rewards, setRewards } =
    useGlobalContext()
  const { apiRequest: getRecentTransactions, loading: gettingRecentTransactions } = useApiRequest<{
    data: ITransaction[]
  }>()
  const { apiRequest: getRecentRewards, loading: gettingRecentRewards } = useApiRequest<{ data: IReward[] }>()
  const allMonthlyUsers = counts?.users?.month?.all ?? 0
  const pendingMonthlyTransactions = counts?.transactions?.month?.pending ?? 0
  const pendingMonthlyRewards = counts?.rewards?.month?.pending ?? 0

  const getTransactions = async () => {
    const response = await getRecentTransactions({
      url: '/admin/transactions',
      params: {
        limit: 10,
      },
    })
    if (response.success) setTransactions(response.data?.data || [])
  }

  const getRewards = async () => {
    const response = await getRecentRewards({
      url: '/admin/rewards',
      params: {
        limit: 10,
      },
    })
    if (response.success) setRewards(response.data?.data || [])
  }

  useEffect(() => {
    ;(async () => {
      getCounts()
      getTransactions()
      getRewards()
    })()
  }, [])

  return (
    <>
      <div className="flex items-center justify-between gap-5">
        <Heading>Good day, {admin?.name}</Heading>
        <Profile />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <Subheading>Overview</Subheading>
      </div>

      <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          title="Pending Transactions"
          value={counts?.transactions?.pending || 0}
          loading={gettingCounts}
          change={`+${pendingMonthlyTransactions} pending ${pendingMonthlyTransactions == 1 ? 'txn' : 'txns'}`}
          description="this month"
        />
        <Stat
          title="Pending Rewards"
          value={counts?.rewards?.pending || 0}
          change={`+${pendingMonthlyRewards} pending ${pendingMonthlyRewards == 1 ? 'reward' : 'rewards'}`}
          description="this month"
          loading={gettingCounts}
        />
        <Stat
          title="Total Users"
          value={counts?.users?.all || 0}
          loading={gettingCounts}
          change={`+${allMonthlyUsers} ${allMonthlyUsers == 1 ? 'user' : 'users'}`}
          description="this month"
        />
        <Stat
          title={'Total Revenue'}
          value={formatToUSD(counts?.revenue?.all || 0)}
          change={formatToUSD(counts?.revenue?.month?.revenue || 0)}
          loading={gettingCounts}
          description="this month"
          isGreen={!!counts?.revenue?.month?.revenue && counts?.revenue?.month?.revenue > 0}
        />
      </div>

      <div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-5">
          <Subheading className="shrink-0">Recent Transactions</Subheading>

          <Link href={'/transactions/all'} className="text-sm font-medium text-[#665FD5]">
            See all transactions
          </Link>
        </div>

        <Table className="mt-4 rounded-[8px]">
          <TableHead>
            <TableRow>
              <TableHeader>Transaction ID</TableHeader>
              <TableHeader>Asset</TableHeader>
              <TableHeader>Platform</TableHeader>
              <TableHeader>Platform Address</TableHeader>
              <TableHeader>Quantity</TableHeader>
              <TableHeader>Rate</TableHeader>
              <TableHeader>Amount</TableHeader>
              {status == 'all' ? <TableHeader>Status</TableHeader> : <></>}
              <TableHeader>Initiation Date</TableHeader>
              <TableHeader>Approval Date</TableHeader>
            </TableRow>
          </TableHead>

          <TableBody>
            {gettingRecentTransactions ? (
              Array.from({ length: 5 }).map((_, index) => <LoadingTable key={index} colspan={11} />)
            ) : transactions?.length ? (
              transactions?.map((transaction) => (
                <TableRow key={transaction._id} href={`/transactions/transaction/${transaction._id}`}>
                  <TableCell className="uppercase text-[#665FD5]">{transaction.key}</TableCell>
                  <TableCell>{transaction.asset.name}</TableCell>
                  <TableCell>{transaction.platform?.platform}</TableCell>
                  <TableCell>{transaction.address}</TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell>{formatToUSD(transaction.rate)}</TableCell>
                  <TableCell>{formatToUSD(transaction.amount)}</TableCell>
                  {status == 'all' ? (
                    <TableCell>
                      {
                        <Badge
                          color={
                            transaction?.status == 'successful'
                              ? 'green'
                              : transaction?.status == 'failed'
                                ? 'zinc'
                                : 'yellow'
                          }
                          className="px-3.5 capitalize"
                        >
                          {transaction?.status}
                        </Badge>
                      }
                    </TableCell>
                  ) : (
                    <></>
                  )}
                  <TableCell>{format(transaction.createdAt, 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    {transaction.dateApproved ? format(transaction.dateApproved, 'MMM d, yyyy') : '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell rowSpan={1} colSpan={11}>
                  <div className="flex w-full grow flex-col items-center justify-center gap-4 pb-6 pt-14 text-center">
                    <Image src={'/svgs/no-data.svg'} alt="no data" width={150} height={150} />
                    <p className="text-lg font-semibold text-gray-700">No data</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-5">
          <Subheading className="shrink-0">Recent Rewards</Subheading>

          <Link href={'/rewards/all'} className="text-sm font-medium text-[#665FD5]">
            See all rewards
          </Link>
        </div>

        <Table className="mt-4 rounded-[8px]">
          <TableHead>
            <TableRow>
              <TableHeader>Reward ID</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>First Name</TableHeader>
              <TableHeader>Last Name</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Initiation Date</TableHeader>
              <TableHeader>Approval Date</TableHeader>
            </TableRow>
          </TableHead>

          <TableBody>
            {gettingRecentRewards ? (
              Array.from({ length: 5 }).map((_, index) => <LoadingTable key={index} colspan={7} />)
            ) : rewards?.length ? (
              rewards?.map((reward) => (
                <TableRow key={reward._id} href={`/rewards/reward/${reward._id}`}>
                  <TableCell className="uppercase text-[#665FD5]">{reward.key}</TableCell>
                  <TableCell>{formatToUSD(reward.amount)}</TableCell>
                  <TableCell>{reward.user?.firstName}</TableCell>
                  <TableCell>{reward.user?.lastName}</TableCell>
                  <TableCell>
                    {
                      <Badge color={reward?.status == 'successful' ? 'green' : 'yellow'} className="px-3.5 capitalize">
                        {reward?.status}
                      </Badge>
                    }
                  </TableCell>
                  <TableCell>{format(reward.createdAt, 'MMM d, yyyy')}</TableCell>
                  <TableCell>{reward.dateApproved ? format(reward.dateApproved, 'MMM d, yyyy') : '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell rowSpan={1} colSpan={7}>
                  <div className="flex w-full grow flex-col items-center justify-center gap-4 pb-6 pt-14 text-center">
                    <Image src={'/svgs/no-data.svg'} alt="no data" width={150} height={150} />
                    <p className="text-lg font-semibold text-gray-700">No data</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
