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
import { RevenueRoutes } from '@/types'
import { Pagination as PaginationType } from '@/types/common'
import { ITransactions } from '@/types/models/counts'
import { ITransaction } from '@/types/models/transaction'
import { format } from 'date-fns'
import { Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Pagination from '../Pagination'
import LoadingTable from '../loader/table'
import { Sort, sortDefault } from '../users'

type Revenue = {
  status: RevenueRoutes
}

type RevenueTab = {
  status: string
  revenueCounts?: ITransactions
}

const tabs = [
  { label: 'Successful Revenue', key: 'successful', href: '/revenue/successful' },
  { label: 'Pending Revenue', key: 'pending', href: '/revenue/pending' },
]

const RevenueTabs = ({ status, revenueCounts }: RevenueTab) => {
  return (
    <ul className="flex border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => (
        <li className="me-2 shrink-0" role="presentation">
          <Link
            href={`/revenue/${tab.key}`}
            className={`inline-block rounded-t-lg border-b-[3px] p-2 text-sm ${status === tab.key ? 'border-[#665FD5] text-[#665FD5] hover:text-[#665FD5] dark:border-purple-500 dark:text-purple-500 dark:hover:text-purple-500' : 'border-transparent text-gray-500 hover:border-transparent hover:text-gray-600 dark:border-gray-700 dark:border-transparent dark:text-gray-400 dark:hover:text-gray-300'}`}
            role="tab"
          >
            {tab.label} ({revenueCounts?.[tab.key as 'pending' | 'all' | 'successful'] || 0})
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function Revenue({ status }: Revenue) {
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const searchParams = useSearchParams()
  const [rowsPerPage, setRowsPerPage] = useState<number>(parseInt(searchParams.get('rowsPerPage') || '10', 10))
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const [sort, setSort] = useState<Sort>(sortDefault)
  const { transactions, setTransactions, counts } = useGlobalContext()
  const [pagination, setPagination] = useState<PaginationType>()
  const { apiRequest, loading } = useApiRequest<{ data: ITransaction[]; pagination: PaginationType }>()

  useEffect(() => {
    ;(async () => {
      const response = await apiRequest({
        url: '/admin/transactions',
        params: {
          limit: rowsPerPage,
          page: currentPage,
          search,
          sort,
          status,
        },
      })
      if (response.success) {
        setTransactions(response.data?.data || [])
        setPagination(response.data?.pagination)
      }
    })()
  }, [pathname, rowsPerPage, sort, search, currentPage, status])

  return (
    <div>
      <div className="mb-4 mt-14 overflow-hidden border-b border-gray-200 dark:border-gray-700">
        <RevenueTabs status={status} revenueCounts={counts?.transactions} />
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
                  transactions?.length &&
                  exportToCSV(
                    transactions.map((transaction) => ({
                      'Transaction ID': transaction.key,
                      Quantity: transaction.quantity,
                      Rate: formatToUSD(transaction.rate),
                      Amount: formatToUSD(transaction.amount),
                      Status: transaction.status,
                      'Initiation Date': format(transaction.createdAt, 'MMM d, yyyy'),
                      'Approval Date': transaction.dateApproved ? format(transaction.dateApproved, 'MMM d, yyyy') : '-',
                    })),
                    `${status} revenue`
                  )
                }
              >
                CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() =>
                  transactions?.length &&
                  exportToExcel(
                    transactions.map((transaction) => ({
                      'Transaction ID': transaction.key,
                      Quantity: transaction.quantity,
                      Rate: formatToUSD(transaction.rate),
                      Amount: formatToUSD(transaction.amount),
                      Status: transaction.status,
                      'Initiation Date': format(transaction.createdAt, 'MMM d, yyyy'),
                      'Approval Date': transaction.dateApproved ? format(transaction.dateApproved, 'MMM d, yyyy') : '-',
                    })),
                    `${status} revenue`
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
            <TableHeader>Transaction ID</TableHeader>
            <TableHeader>Quantity</TableHeader>
            <TableHeader>Rate</TableHeader>
            <TableHeader>Amount</TableHeader>
            <TableHeader>Initiation Date</TableHeader>
            <TableHeader>Approval Date</TableHeader>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => <LoadingTable key={index} colspan={6} />)
          ) : transactions?.length ? (
            transactions?.map((transaction) => (
              <TableRow key={transaction._id} href={`/revenue/revenue/${transaction._id}`}>
                <TableCell className="uppercase text-[#665FD5]">{transaction.key}</TableCell>
                <TableCell>{transaction.quantity}</TableCell>
                <TableCell>{formatToUSD(transaction.rate)}</TableCell>
                <TableCell>{formatToUSD(transaction.amount)}</TableCell>
                <TableCell>{format(transaction.createdAt, 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  {transaction.dateApproved ? format(transaction.dateApproved, 'MMM d, yyyy') : '-'}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell rowSpan={1} colSpan={6}>
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
