'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGlobalContext } from '@/context/GlobalContext'
import { exportToCSV, exportToExcel, formatToUSD } from '@/helpers/common'
import { useApiRequest } from '@/hooks/useApiRequest'
import { RewardRoutes } from '@/types'
import { Pagination as PaginationType } from '@/types/common'
import { IRewards } from '@/types/models/counts'
import { IReward } from '@/types/models/reward'
import { format } from 'date-fns'
import { Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Pagination from '../Pagination'
import { Badge } from '../badge'
import LoadingTable from '../loader/table'
import { Sort, sortDefault } from '../users'

type Rewards = {
  status: RewardRoutes
}

type RewardTab = {
  status: string
  rewardCounts?: IRewards
}

const tabs = [
  { label: 'All Rewards', key: 'all', href: '/rewards/all' },
  { label: 'Pending Rewards', key: 'pending', href: '/rewards/pending' },
  { label: 'Successful Rewards', key: 'successful', href: '/rewards/successful' },
]

const RewardTabs = ({ status, rewardCounts }: RewardTab) => {
  return (
    <ul className="flex border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => (
        <li className="me-2 shrink-0" role="presentation">
          <Link
            href={`/rewards/${tab.key}`}
            className={`inline-block rounded-t-lg border-b-[3px] p-2 text-sm ${status === tab.key ? 'border-[#665FD5] text-[#665FD5] hover:text-[#665FD5] dark:border-purple-500 dark:text-purple-500 dark:hover:text-purple-500' : 'border-transparent text-gray-500 hover:border-transparent hover:text-gray-600 dark:border-gray-700 dark:border-transparent dark:text-gray-400 dark:hover:text-gray-300'}`}
            role="tab"
          >
            {tab.label} ({rewardCounts?.[tab.key as 'pending' | 'all' | 'successful'] || 0})
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function Rewards({ status }: Rewards) {
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const searchParams = useSearchParams()
  const [rowsPerPage, setRowsPerPage] = useState<number>(parseInt(searchParams.get('rowsPerPage') || '10', 10))
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const [sort, setSort] = useState<Sort>(sortDefault)
  const { rewards, setRewards, counts } = useGlobalContext()
  const [pagination, setPagination] = useState<PaginationType>()
  const { apiRequest, loading } = useApiRequest<{ data: IReward[]; pagination: PaginationType }>()

  useEffect(() => {
    ;(async () => {
      const response = await apiRequest({
        url: '/admin/rewards',
        params: {
          limit: rowsPerPage,
          page: currentPage,
          search,
          sort,
          status,
        },
      })
      if (response.success) {
        setRewards(response.data?.data || [])
        setPagination(response.data?.pagination)
      }
    })()
  }, [pathname, rowsPerPage, sort, search, currentPage, status])

  return (
    <div>
      <div className="mb-4 mt-14 overflow-hidden border-b border-gray-200 dark:border-gray-700">
        <RewardTabs status={status} rewardCounts={counts?.rewards} />
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-5">
        <div className="relative">
          <Search className="absolute left-2 top-[50%] z-10 h-4 w-4 -translate-y-[50%] text-muted-foreground" />
          <Input placeholder="search" className="pl-8" onChange={(e) => setSearch(e.target.value)} value={search} />
        </div>

        <div className="flex gap-2">
          <Select onValueChange={(value: Sort) => setSort(value)}>
            <SelectTrigger className="gap-2">
              <SelectValue placeholder={sortDefault == 'desc' ? 'Newest to Oldest' : 'Oldest to Newest'} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="desc">Newest to Oldest</SelectItem>
                <SelectItem value="asc">Oldest to Newest</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="cursor-pointer">
              <Button
                className="shrink-0"
                style={{
                  paddingInline: 20,
                }}
              >
                Export
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-32 rounded-[8px]" side="bottom" align="end">
              <DropdownMenuItem
                onClick={() =>
                  rewards?.length &&
                  exportToCSV(
                    rewards.map((reward) => ({
                      'Reward ID': reward.key,
                      Amount: formatToUSD(reward.amount),
                      'First Name': reward.user?.firstName,
                      'Last Name': reward.user?.lastName,
                      Status: reward.status,
                      'Initiation Date': format(reward.createdAt, 'MMM d, yyyy'),
                    })),
                    `${status} rewards`
                  )
                }
              >
                CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() =>
                  rewards?.length &&
                  exportToExcel(
                    rewards.map((reward) => ({
                      'Reward ID': reward.key,
                      Amount: formatToUSD(reward.amount),
                      'First Name': reward.user?.firstName,
                      'Last Name': reward.user?.lastName,
                      Status: reward.status,
                      'Initiation Date': format(reward.createdAt, 'MMM d, yyyy'),
                    })),
                    `${status} rewards`
                  )
                }
              >
                Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Table className="mt-4 rounded-[8px]">
        <TableHead>
          <TableRow>
            <TableHeader>Reward ID</TableHeader>
            <TableHeader>Amount</TableHeader>
            <TableHeader>First Name</TableHeader>
            <TableHeader>Last Name</TableHeader>
            {status == 'all' ? <TableHeader>Status</TableHeader> : <></>}
            <TableHeader>Initiation Date</TableHeader>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => <LoadingTable key={index} colspan={status == 'all' ? 6 : 5} />)
          ) : rewards?.length ? (
            rewards?.map((reward) => (
              <TableRow key={reward._id} href={`/rewards/reward/${reward._id}`}>
                <TableCell className="uppercase text-[#665FD5]">{reward.key}</TableCell>
                <TableCell>{formatToUSD(reward.amount)}</TableCell>
                <TableCell>{reward.user?.firstName}</TableCell>
                <TableCell>{reward.user?.lastName}</TableCell>
                {status == 'all' ? (
                  <TableCell>
                    {
                      <Badge color={reward?.status == 'successful' ? 'green' : 'yellow'} className="px-3.5 capitalize">
                        {reward?.status}
                      </Badge>
                    }
                  </TableCell>
                ) : (
                  <></>
                )}
                <TableCell>{format(reward.createdAt, 'MMM d, yyyy')}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell rowSpan={1} colSpan={status == 'all' ? 6 : 5}>
                <div className="flex w-full grow flex-col items-center justify-center gap-4 pb-6 pt-14 text-center">
                  <Image src={'/svgs/no-data.svg'} alt="no data" width={150} height={150} />
                  <p className="text-lg font-semibold text-gray-700">No data</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {loading ? (
        <></>
      ) : pagination && pagination?.totalPages > 1 ? (
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={pagination.total}
          totalPages={pagination?.totalPages}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
        />
      ) : (
        <></>
      )}
    </div>
  )
}
