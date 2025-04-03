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
import { exportToCSV, exportToExcel } from '@/helpers/common'
import { useApiRequest } from '@/hooks/useApiRequest'
import { TransactionRoutes } from '@/types'
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
import { Badge } from '../badge'
import LoadingTable from '../loader/table'
import { Sort, sortDefault } from '../users'

type Transactions = {
  status: TransactionRoutes
}

type TransactionTab = {
  status: string
  transactionCounts?: ITransactions
}

const tabs = [
  { label: 'All Transactions', key: 'all', href: '/transactions/all' },
  { label: 'Pending Transactions', key: 'pending', href: '/transactions/pending' },
  { label: 'Successful Transactions', key: 'successful', href: '/transactions/successful' },
  { label: 'Failed Transactions', key: 'failed', href: '/transactions/failed' },
]

const TransactionTabs = ({ status, transactionCounts }: TransactionTab) => {
  return (
    <ul className="flex border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => (
        <li className="me-2 shrink-0" role="presentation">
          <Link
            href={`/transactions/${tab.key}`}
            className={`inline-block rounded-t-lg border-b-[3px] p-2 text-sm ${status === tab.key ? 'border-[#665FD5] text-[#665FD5] hover:text-[#665FD5] dark:border-purple-500 dark:text-purple-500 dark:hover:text-purple-500' : 'border-transparent text-gray-500 hover:border-transparent hover:text-gray-600 dark:border-gray-700 dark:border-transparent dark:text-gray-400 dark:hover:text-gray-300'}`}
            role="tab"
          >
            {tab.label} ({transactionCounts?.[tab.key as 'pending' | 'all' | 'successful' | 'failed'] || 0})
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function Transactions({ status }: Transactions) {
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
        <TransactionTabs status={status} transactionCounts={counts?.transactions} />
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
                      Asset: transaction.asset.name,
                      Network: `${transaction.platform.platform[0].toUpperCase()}${transaction.platform.platform?.slice(1).toLowerCase()}`,
                      'Network Address': transaction.address,
                      Quantity: transaction.quantity,
                      Rate: transaction.rate,
                      Status: transaction.status,
                      'Initiation Date': format(transaction.createdAt, 'MMM d, yyyy'),
                    })),
                    `${status} transactions`
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
                      Asset: transaction.asset.name,
                      Network: `${transaction.platform.platform[0].toUpperCase()}${transaction.platform.platform?.slice(1).toLowerCase()}`,
                      'Network Address': transaction.address,
                      Quantity: transaction.quantity,
                      Rate: transaction.rate,
                      Status: transaction.status,
                      'Initiation Date': format(transaction.createdAt, 'MMM d, yyyy'),
                    })),
                    `${status} transactions`
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
            <TableHeader>Asset</TableHeader>
            <TableHeader>Network</TableHeader>
            <TableHeader>Network Address</TableHeader>
            <TableHeader>Quantity</TableHeader>
            <TableHeader>Rate</TableHeader>
            {status == 'all' ? <TableHeader>Status</TableHeader> : <></>}
            <TableHeader>Initiation Date</TableHeader>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => <LoadingTable key={index} colspan={status == 'all' ? 8 : 7} />)
          ) : transactions?.length ? (
            transactions?.map((transaction) => (
              <TableRow key={transaction._id} href={`/transactions/transaction/${transaction._id}`}>
                <TableCell className="uppercase text-[#665FD5]">{transaction.key}</TableCell>
                <TableCell>{transaction.asset.name}</TableCell>
                <TableCell className="capitalize">{transaction.platform?.platform}</TableCell>
                <TableCell>{transaction.address}</TableCell>
                <TableCell>{transaction.quantity}</TableCell>
                <TableCell>{transaction.rate}</TableCell>
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
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell rowSpan={1} colSpan={status == 'all' ? 8 : 7}>
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
