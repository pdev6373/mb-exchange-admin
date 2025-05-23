'use client'
import { Badge } from '@/components/badge'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/description-list'
import { Divider } from '@/components/divider'
import { Subheading } from '@/components/heading'
import Line from '@/components/loader/line'
import Profile from '@/components/profile'
import { useApiRequest } from '@/hooks/useApiRequest'
import { IUserTransaction } from '@/types/models/transaction'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import { format } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Revenue = {
  params: { id: string }
}

export default function RevenueDetails({ params }: Revenue) {
  const router = useRouter()
  const [transaction, setTransaction] = useState<IUserTransaction>()
  const { apiRequest: getTransaction, loading: gettingTransaction } = useApiRequest<IUserTransaction>()

  const fetchTransaction = async () => {
    const response = await getTransaction({
      url: `/admin/transactions/${params.id}`,
    })
    if (response.success) setTransaction(response.data)
    else router.replace('/revenue/successful')
  }

  useEffect(() => {
    if (!params.id) return
    fetchTransaction()
  }, [params])

  return (
    <>
      <div className="flex items-center justify-between gap-5 max-lg:hidden">
        <p
          onClick={router.back}
          className="inline-flex cursor-pointer items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400"
        >
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Revenue
        </p>

        <Profile />
      </div>

      <div className="mt-10">
        {gettingTransaction ? <Line styles="w-32 h-7" /> : <Subheading>Revenue Information</Subheading>}
        <Divider className="mt-4" />

        {gettingTransaction ? (
          <div className="mt-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <Line styles="rounded-none h-10 w-full my-[1px]" key={index} />
            ))}
          </div>
        ) : (
          <DescriptionList>
            <DescriptionTerm>Transaction ID:</DescriptionTerm>
            <DescriptionDetails>
              <Link
                href={`/transactions/transaction/${transaction?.transaction?._id}`}
                className="cursor-pointer text-[#665FD5] underline underline-offset-2"
              >
                {transaction?.transaction?.key || 'View transaction'}
              </Link>
            </DescriptionDetails>
            <DescriptionTerm>Status:</DescriptionTerm>
            <DescriptionDetails>
              <Badge
                color={
                  transaction?.transaction?.status == 'successful'
                    ? 'green'
                    : transaction?.transaction?.status == 'failed'
                      ? 'zinc'
                      : 'yellow'
                }
                className="px-3.5 capitalize"
              >
                {transaction?.transaction?.status}
              </Badge>
            </DescriptionDetails>
            <DescriptionTerm>User:</DescriptionTerm>
            <DescriptionDetails>
              {transaction?.transaction?.user ? (
                <Link
                  href={`/users/user/${transaction?.transaction?.user?.id}`}
                  className="cursor-pointer text-[#665FD5] underline underline-offset-2"
                >
                  {transaction?.transaction?.user?.firstName
                    ? `${transaction.user.firstName} ${transaction.user.lastName}`
                    : 'View profile'}
                </Link>
              ) : (
                <p>-</p>
              )}
            </DescriptionDetails>
            <DescriptionTerm>Quantity:</DescriptionTerm>
            <DescriptionDetails>{transaction?.transaction?.quantity || '-'}</DescriptionDetails>
            <DescriptionTerm>Rate:</DescriptionTerm>
            <DescriptionDetails>
              {transaction?.transaction?.rate ? transaction?.transaction?.rate : '-'}
            </DescriptionDetails>
            <DescriptionTerm>Transaction Initiation Date:</DescriptionTerm>
            <DescriptionDetails>
              {transaction ? format(transaction?.transaction?.createdAt, 'MMMM d, yyyy') : '-'}
            </DescriptionDetails>
            <DescriptionTerm>Transaction Approval Date:</DescriptionTerm>
            <DescriptionDetails>
              {transaction?.transaction?.dateApproved
                ? format(transaction?.transaction?.dateApproved, 'MMMM d, yyyy')
                : '-'}
            </DescriptionDetails>
          </DescriptionList>
        )}
      </div>
    </>
  )
}
