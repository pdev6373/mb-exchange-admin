'use client'
import { Badge } from '@/components/badge'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/description-list'
import { Divider } from '@/components/divider'
import { Subheading } from '@/components/heading'
import Line from '@/components/loader/line'
import Profile from '@/components/profile'
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
import { useGlobalContext } from '@/context/GlobalContext'
import { useApiRequest } from '@/hooks/useApiRequest'
import { ITransaction, TransactionStatusType } from '@/types/models/transaction'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import { format } from 'date-fns'
import { LoaderIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Transaction = {
  params: { id: string }
}

export default function Transaction({ params }: Transaction) {
  const router = useRouter()
  const {} = useGlobalContext()
  const [showAlert, setShowAlert] = useState(false)
  const [transaction, setTransaction] = useState<ITransaction>()
  const { apiRequest: getTransaction, loading: gettingTransaction } = useApiRequest<ITransaction>()
  const { apiRequest: updateTransaction, loading: updatingTransaction } = useApiRequest<ITransaction>()
  const [status, setStatus] = useState<TransactionStatusType>('pending')
  const [amountTransferred, setAmountTransferred] = useState<string>()

  const fetchTransaction = async () => {
    const response = await getTransaction({
      url: `/admin/transactions/${params.id}`,
    })
    if (response.success) setTransaction(response.data)
    else router.replace('/transactions/all')
  }

  const updateTransactionStatus = async () => {
    if (!amountTransferred && status == 'successful') return

    const response = await updateTransaction({
      url: `/admin/transactions/${params.id}/${status}/${Number(amountTransferred) || 0}`,
      method: 'PATCH',
      showToast: true,
    })
    if (response.success) {
      setTransaction(response.data)
      setAmountTransferred(undefined)
    }
    setShowAlert(false)
  }

  useEffect(() => {
    if (!params.id) return
    fetchTransaction()
  }, [params])

  return (
    <>
      <AlertDialog open={showAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{`Mark as ${status}?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {`This action will mark this transaction as ${status}, are you sure you want to continue?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {status == 'successful' ? (
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                {`Amount Transferred (In Dollars)`}
              </label>
              <div className="mt-1.5">
                <input
                  value={amountTransferred}
                  onChange={(e) => setAmountTransferred(e.target.value)}
                  className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-[#ccc] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#333] sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          ) : (
            <></>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowAlert(false)
                setAmountTransferred(undefined)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                status == 'successful'
                  ? 'bg-green-600 text-white hover:bg-green-600'
                  : status == 'pending'
                    ? 'bg-[#fe9705] text-white hover:bg-[#fe9705]'
                    : 'bg-destructive text-destructive-foreground hover:bg-destructive'
              }
              onClick={updateTransactionStatus}
              disabled={Number(amountTransferred) <= 0 && status == 'successful'}
            >
              {updatingTransaction ? (
                <div className="py-1">
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                'Proceed'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between gap-5 max-lg:hidden">
        <p
          onClick={router.back}
          className="inline-flex cursor-pointer items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400"
        >
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Transactions
        </p>

        <Profile />
      </div>

      <div className="mt-10">
        {gettingTransaction ? (
          <div className="flex items-center justify-between">
            <Line styles="w-32 h-7" />

            <div className="flex flex-wrap items-center gap-2">
              <Line styles="w-36 h-9" />
              <Line styles="w-36 h-9" />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Subheading>Transactions Information</Subheading>

            <div className="flex flex-wrap items-center gap-2">
              {transaction?.status !== 'successful' ? (
                <Button
                  variant={'success'}
                  className="shrink-0"
                  onClick={() => {
                    setStatus('successful')
                    setShowAlert(true)
                  }}
                >
                  Mark as successful
                </Button>
              ) : (
                <></>
              )}

              {transaction?.status !== 'pending' ? (
                <Button
                  variant={'pending'}
                  className="shrink-0"
                  onClick={() => {
                    setStatus('pending')
                    setShowAlert(true)
                  }}
                >
                  Mark as pending
                </Button>
              ) : (
                <></>
              )}

              {transaction?.status !== 'failed' ? (
                <Button
                  variant={'destructive'}
                  className="shrink-0"
                  onClick={() => {
                    setStatus('failed')
                    setShowAlert(true)
                  }}
                >
                  Mark as failed
                </Button>
              ) : (
                <></>
              )}
            </div>
          </div>
        )}
        <Divider className="mt-4" />

        {gettingTransaction ? (
          <div className="mt-5">
            {Array.from({ length: 12 }).map((_, index) => (
              <Line styles="rounded-none h-10 w-full my-[1px]" key={index} />
            ))}
          </div>
        ) : (
          <DescriptionList>
            <DescriptionTerm>Transaction ID:</DescriptionTerm>
            <DescriptionDetails>{transaction?.key || '-'}</DescriptionDetails>
            <DescriptionTerm>Transaction Status:</DescriptionTerm>
            <DescriptionDetails>
              <Badge
                color={
                  transaction?.status == 'successful' ? 'green' : transaction?.status == 'failed' ? 'zinc' : 'yellow'
                }
                className="px-3.5 capitalize"
              >
                {transaction?.status}
              </Badge>
            </DescriptionDetails>
            <DescriptionTerm>User:</DescriptionTerm>
            <DescriptionDetails>
              {transaction?.user ? (
                <Link
                  href={`/users/user/${transaction?.user?.id}`}
                  className="cursor-pointer text-[#665FD5] underline underline-offset-2"
                >
                  {transaction?.user?.firstName
                    ? `${transaction.user.firstName} ${transaction.user.lastName}`
                    : 'View profile'}
                </Link>
              ) : (
                <p>-</p>
              )}
            </DescriptionDetails>
            <DescriptionTerm>Asset:</DescriptionTerm>
            <DescriptionDetails>
              {transaction?.asset?.name
                ? `${transaction?.asset?.name} (${transaction?.asset?.symbol?.toUpperCase()})`
                : '-'}
            </DescriptionDetails>
            <DescriptionTerm>Network:</DescriptionTerm>
            <DescriptionDetails className="capitalize">{transaction?.platform?.platform || '-'}</DescriptionDetails>
            <DescriptionTerm>Address:</DescriptionTerm>
            <DescriptionDetails>{transaction?.address || '-'}</DescriptionDetails>
            <DescriptionTerm>Quantity:</DescriptionTerm>
            <DescriptionDetails>{transaction?.quantity || '-'}</DescriptionDetails>
            <DescriptionTerm>Rate:</DescriptionTerm>
            <DescriptionDetails>{transaction?.rate || '-'}</DescriptionDetails>
            <DescriptionTerm>Transaction Initiation Date:</DescriptionTerm>
            <DescriptionDetails>{transaction ? format(transaction.createdAt, 'MMMM d, yyyy') : '-'}</DescriptionDetails>
            <DescriptionTerm>Transaction Approval Date:</DescriptionTerm>
            <DescriptionDetails>
              {transaction?.dateApproved ? format(transaction?.dateApproved, 'MMMM d, yyyy') : '-'}
            </DescriptionDetails>
            <DescriptionTerm>Proof:</DescriptionTerm>
            <DescriptionDetails>
              {transaction?.proof ? (
                <div className="relative h-64 w-full md:h-96">
                  <Image
                    src={transaction?.proof}
                    alt="Transaction proof"
                    fill
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ) : (
                '-'
              )}
            </DescriptionDetails>
          </DescriptionList>
        )}
      </div>
    </>
  )
}
