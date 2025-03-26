'use client'
import { Badge } from '@/components/badge'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/description-list'
import { Divider } from '@/components/divider'
import { Subheading } from '@/components/heading'
import Line from '@/components/loader/line'
import LoadingTable from '@/components/loader/table'
import Profile from '@/components/profile'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { formatToUSD } from '@/helpers/common'
import { useApiRequest } from '@/hooks/useApiRequest'
import { RegistrationStatus } from '@/types/enums'
import { IReward } from '@/types/models/reward'
import { ITransaction } from '@/types/models/transaction'
import { IUser } from '@/types/models/user'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import { format } from 'date-fns'
import { LoaderIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type TransactionCount = {
  title: string
  count?: number
}

const TransactionCount = ({ count = 0, title }: TransactionCount) => (
  <div className="flex flex-wrap gap-1">
    <p
      className="text-sm text-zinc-500"
      style={{
        padding: 0,
        margin: 0,
      }}
    >
      {title}:
    </p>
    <p
      className="text-sm"
      style={{
        padding: 0,
        margin: 0,
      }}
    >
      {count}
    </p>
  </div>
)

export default function User({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<IUser>()
  const [showAlert, setShowAlert] = useState(false)
  const [transactions, setTransactions] = useState<ITransaction[]>([])
  const [rewards, setRewards] = useState<IReward[]>([])
  const { apiRequest: getUser, loading: gettingUser } = useApiRequest<IUser>()
  const { apiRequest: getTransactions, loading: gettingTransactions } = useApiRequest<ITransaction[]>()
  const { apiRequest: getRewards, loading: gettingRewards } = useApiRequest<IReward[]>()
  const { apiRequest: deleteUser, loading: deletingUser } = useApiRequest<ITransaction[]>()

  const fetchUser = async () => {
    const response = await getUser({
      url: `/admin/users/${params.id}`,
    })
    if (response.success) setUser(response.data)
    else router.replace('/users/all')
  }

  const fetchTransactions = async () => {
    const response = await getTransactions({
      url: `/admin/transactions/user/${params.id}`,
    })
    if (response.success) setTransactions(response.data || [])
  }

  const fetchRewards = async () => {
    const response = await getRewards({
      url: `/admin/rewards/user/${params.id}`,
    })
    if (response.success) setRewards(response.data || [])
  }

  const deleteCurrentUser = async () => {
    const response = await deleteUser({
      url: `/admin/users/${params.id}`,
      method: 'DELETE',
      showToast: true,
    })
    if (response.success) router.replace('/users')
  }

  useEffect(() => {
    if (!params.id) return
    fetchUser()
    fetchTransactions()
    fetchRewards()
  }, [params])

  return (
    <>
      <AlertDialog open={showAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this user's account and remove your data from our servers, and it is
              not reversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAlert(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive"
              onClick={deleteCurrentUser}
            >
              {deletingUser ? (
                <div className="py-1">
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between gap-5 max-lg:hidden">
        <div
          onClick={router.back}
          className="inline-flex cursor-pointer items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400"
        >
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Users
        </div>

        <Profile />
      </div>

      <div className="mt-4 lg:mt-8">
        {gettingUser ? (
          <div className="mt-4 flex flex-col gap-2.5">
            <Line styles="w-full h-6 rounded-[2px]" />
            <Line styles="w-[90%] h-6 rounded-[2px]" />
          </div>
        ) : (
          <div className="my-4 flex flex-col gap-2.5">
            <div className="flex flex-wrap gap-x-7 gap-y-2.5">
              <TransactionCount title="All Transactions" count={user?.totalTransactions} />
              <TransactionCount title="Pending Transactions" count={user?.pendingTransactions} />
              <TransactionCount title="Successful Transactions" count={user?.successfulTransactions} />
              <TransactionCount title="Failed Transactions" count={user?.failedTransactions} />
            </div>
            <div className="flex flex-wrap gap-x-7 gap-y-2.5">
              <TransactionCount title="All Rewards" count={user?.totalRewards} />
              <TransactionCount title="Pending Rewards" count={user?.pendingRewards} />
              <TransactionCount title="Successful Rewards" count={user?.successfulRewards} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        {gettingUser ? (
          <div className="mt-2">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <Line styles="w-28 h-6" />
            </div>
            <div className="mt-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <Line styles="rounded-none h-10 w-full my-[1px]" key={index} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Subheading>Basic Information</Subheading>
              <Button
                className="flex items-center justify-center rounded-[4px] border border-[#DC2626] bg-transparent text-center text-[#DC2626] hover:bg-transparent"
                onClick={() => setShowAlert(true)}
              >
                Delete User
              </Button>
            </div>

            <Divider className="mt-4" />
            <DescriptionList>
              <DescriptionTerm>Email Address:</DescriptionTerm>
              <DescriptionDetails>{user?.email || '-'}</DescriptionDetails>
              <DescriptionTerm>Full name:</DescriptionTerm>
              <DescriptionDetails>{user?.firstName ? `${user?.firstName} ${user?.lastName}` : '-'}</DescriptionDetails>
              <DescriptionTerm>Username:</DescriptionTerm>
              <DescriptionDetails>{user?.userName || '-'}</DescriptionDetails>
              <DescriptionTerm>Phone number:</DescriptionTerm>
              <DescriptionDetails>{user?.phoneNumber || '-'}</DescriptionDetails>
              <DescriptionTerm>Points:</DescriptionTerm>
              <DescriptionDetails>{user?.points || 0}</DescriptionDetails>
              <DescriptionTerm>Country:</DescriptionTerm>
              <DescriptionDetails>
                <div className="flex items-center gap-2">
                  {user?.country?.flag ? <p>{user?.country?.flag}</p> : <></>}
                  {user?.country?.name ? `${user.country.name} (${user?.country?.code})` : '-'}
                </div>
              </DescriptionDetails>
              <DescriptionTerm>Gender:</DescriptionTerm>
              <DescriptionDetails className="capitalize">{user?.gender || '-'}</DescriptionDetails>
              <DescriptionTerm>Referred:</DescriptionTerm>
              <DescriptionDetails>{user?.referred || 0}</DescriptionDetails>
              <DescriptionTerm>Referrer:</DescriptionTerm>
              <DescriptionDetails>
                {user?.referrer?.id ? (
                  <Link
                    href={`/users/user/${user?.referrer?.id}`}
                    className="cursor-pointer text-[#665FD5] underline underline-offset-2"
                  >
                    {user?.referrer?.firstName
                      ? `${user?.referrer?.firstName} ${user?.referrer?.lastName}`
                      : 'View profile'}
                  </Link>
                ) : (
                  '-'
                )}
              </DescriptionDetails>
              <DescriptionTerm>Referral Code:</DescriptionTerm>
              <DescriptionDetails>{user?.referralCode || '-'}</DescriptionDetails>
              <DescriptionTerm>Active:</DescriptionTerm>
              <DescriptionDetails>
                <Badge
                  color={user?.registrationStatus == RegistrationStatus.ACTIVE ? 'green' : 'zinc'}
                  className="capitalize"
                >
                  {user?.registrationStatus == RegistrationStatus.ACTIVE ? 'true' : 'false'}
                </Badge>
              </DescriptionDetails>
              <DescriptionTerm>Date of Birth:</DescriptionTerm>
              <DescriptionDetails>
                {user?.dateOfBirth ? format(user.dateOfBirth, 'MMM d, yyyy') : '-'}
              </DescriptionDetails>
              <DescriptionTerm>Registration Date:</DescriptionTerm>
              <DescriptionDetails>{user?.createdAt ? format(user.createdAt, 'MMM d, yyyy') : '-'}</DescriptionDetails>
            </DescriptionList>
          </>
        )}
      </div>

      <div className="mt-8">
        <Subheading className="shrink-0">Transaction History</Subheading>

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
              <TableHeader>Status</TableHeader>
              <TableHeader>Initiation Date</TableHeader>
              <TableHeader>Approval Date</TableHeader>
            </TableRow>
          </TableHead>

          <TableBody>
            {gettingTransactions ? (
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

      <div className="mt-8">
        <Subheading className="shrink-0">Reward History</Subheading>

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
            {gettingRewards ? (
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
