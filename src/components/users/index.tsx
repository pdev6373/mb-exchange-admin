'use client'
import Pagination from '@/components/Pagination'
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
import { Pagination as PaginationType } from '@/types/common'
import { IUsers } from '@/types/models/counts'
import { IUser } from '@/types/models/user'
import { Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoadingTable from '../loader/table'

type Users = {
  type: string
}
type UserTab = {
  type: string
  userCounts?: IUsers
}

export type Sort = 'asc' | 'desc'
export const sortDefault: Sort = 'desc'

const tabs = [
  { label: 'All Users', key: 'all', href: '/users/all' },
  { label: 'Active Users', key: 'active', href: '/users/active' },
  { label: 'Inactive Users', key: 'inactive', href: '/users/inactive' },
]

const UserTabs = ({ type, userCounts }: UserTab) => {
  return (
    <ul className="flex border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => (
        <li key={tab.key} className="me-2 shrink-0" role="presentation">
          <Link
            href={tab.href}
            className={`inline-block rounded-t-lg border-b-[3px] p-2 text-sm ${
              type === tab.key
                ? 'border-[#665FD5] text-[#665FD5] hover:text-[#665FD5] dark:border-purple-500 dark:text-purple-500 dark:hover:text-purple-500'
                : 'border-transparent text-gray-500 hover:border-transparent hover:text-gray-600 dark:border-gray-700 dark:border-transparent dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            role="tab"
          >
            {tab.label} ({userCounts?.[tab.key as 'active' | 'inactive' | 'all'] || 0})
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function Users({ type }: Users) {
  const { users, currentPage, setCurrentPage, setUsers, counts } = useGlobalContext()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [rowsPerPage, setRowsPerPage] = useState<number>(parseInt(searchParams.get('rowsPerPage') || '10', 10))
  const [sort, setSort] = useState<Sort>(sortDefault)
  const [pagination, setPagination] = useState<PaginationType>()
  const [search, setSearch] = useState('')
  const { apiRequest, loading } = useApiRequest<{ data: IUser[]; pagination: PaginationType }>()

  useEffect(() => {
    ;(async () => {
      const response = await apiRequest({
        url: '/admin/users',
        params: {
          limit: rowsPerPage,
          page: currentPage,
          search,
          sort,
          status: type,
        },
      })
      if (response.success) {
        setUsers(response.data?.data || [])
        setPagination(response.data?.pagination)
      }
    })()
  }, [sort, pathname, rowsPerPage, currentPage, search, type])

  return (
    <div>
      <div className="mb-4 mt-14 overflow-hidden border-b border-gray-200 dark:border-gray-700">
        <UserTabs userCounts={counts?.users} type={type} />
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
                  users?.length &&
                  exportToCSV(
                    users?.map((user) => ({
                      'Email Address': user?.email || '-',
                      'Full Name': user?.firstName ? `${user?.firstName} ${user?.lastName}` : '-',
                      'Phone Number': user?.phoneNumber,
                      Country: user?.country?.name,
                      'Total Transactions': user?.totalTransactions,
                      'Pending Transactions': user?.pendingTransactions,
                      'Succesful Transactions': user?.successfulTransactions,
                      'Failed Transactions': user?.failedTransactions,
                    })),
                    `${type} ${type === 'all' ? 'users' : ''}`
                  )
                }
              >
                CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() =>
                  users?.length &&
                  exportToExcel(
                    users?.map((user) => ({
                      'Email Address': user?.email || '-',
                      'Full Name': user?.firstName ? `${user?.firstName} ${user?.lastName}` : '-',
                      'Phone Number': user?.phoneNumber,
                      Country: user?.country?.name,
                      'Total Transactions': user?.totalTransactions,
                      'Pending Transactions': user?.pendingTransactions,
                      'Succesful Transactions': user?.successfulTransactions,
                      'Failed Transactions': user?.failedTransactions,
                    })),
                    `${type} ${type === 'all' ? 'users' : ''}`
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
            <TableHeader>Email Address</TableHeader>
            <TableHeader>Full Name</TableHeader>
            <TableHeader>Phone Number</TableHeader>
            <TableHeader>Country</TableHeader>
            <TableHeader>Total Transactions</TableHeader>
            <TableHeader>Pending Transactions</TableHeader>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => <LoadingTable key={index} colspan={6} />)
          ) : users?.length ? (
            users?.map((user) => (
              <TableRow key={user._id} href={`/users/user/${user._id}`}>
                <TableCell>{user?.email}</TableCell>
                <TableCell>{user?.firstName ? `${user?.firstName} ${user?.lastName}` : '-'}</TableCell>
                <TableCell>{user?.phoneNumber || '-'}</TableCell>
                <TableCell>{user?.country?.name || '-'}</TableCell>
                <TableCell>{user?.totalTransactions || 0}</TableCell>
                <TableCell>{user?.pendingTransactions || 0}</TableCell>
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
