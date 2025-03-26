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
import { formatToUSD } from '@/helpers/common'
import { useApiRequest } from '@/hooks/useApiRequest'
import { IReward, RewardStatusType } from '@/types/models/reward'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import { format } from 'date-fns'
import { LoaderIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Reward = {
  params: { id: string }
}

export default function Trabsaction({ params }: Reward) {
  const router = useRouter()
  const {} = useGlobalContext()
  const [showAlert, setShowAlert] = useState(false)
  const [reward, setReward] = useState<IReward>()
  const { apiRequest: getReward, loading: gettingReward } = useApiRequest<IReward>()
  const { apiRequest: updateReward, loading: updatingReward } = useApiRequest<IReward>()
  const [status, setStatus] = useState<RewardStatusType>('pending')

  const fetchReward = async () => {
    const response = await getReward({
      url: `/admin/rewards/${params.id}`,
    })
    if (response.success) setReward(response.data)
    else router.replace('/rewards/all')
  }

  const updateRewardStatus = async () => {
    const response = await updateReward({
      url: `/admin/rewards/${params.id}/${status}`,
      method: 'PATCH',
      showToast: true,
    })
    if (response.success) setReward(response.data)
    setShowAlert(false)
  }

  useEffect(() => {
    if (!params.id) return
    fetchReward()
  }, [params])

  return (
    <>
      <AlertDialog open={showAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{`Mark as ${status}?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {`This action will mark this reward as ${status}, are you sure you want to continue?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAlert(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={
                status == 'successful'
                  ? 'bg-green-600 text-white hover:bg-green-600'
                  : status == 'pending'
                    ? 'bg-[#fe9705] text-white hover:bg-[#fe9705]'
                    : 'bg-destructive text-destructive-foreground hover:bg-destructive'
              }
              onClick={updateRewardStatus}
            >
              {updatingReward ? (
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
          Rewards
        </p>

        <Profile />
      </div>

      <div className="mt-10">
        {gettingReward ? (
          <div className="flex items-center justify-between">
            <Line styles="w-32 h-7" />
            <Line styles="w-36 h-9" />
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Subheading>Reward Information</Subheading>

            <div className="flex flex-wrap items-center gap-2">
              {reward?.status !== 'successful' ? (
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

              {reward?.status !== 'pending' ? (
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
            </div>
          </div>
        )}
        <Divider className="mt-4" />

        {gettingReward ? (
          <div className="mt-5">
            {Array.from({ length: 12 }).map((_, index) => (
              <Line styles="rounded-none h-10 w-full my-[1px]" key={index} />
            ))}
          </div>
        ) : (
          <DescriptionList>
            <DescriptionTerm>Reward ID:</DescriptionTerm>
            <DescriptionDetails>{reward?.key || '-'}</DescriptionDetails>
            <DescriptionTerm>Reward Status:</DescriptionTerm>
            <DescriptionDetails>
              <Badge color={reward?.status == 'successful' ? 'green' : 'yellow'} className="px-3.5 capitalize">
                {reward?.status}
              </Badge>
            </DescriptionDetails>
            <DescriptionTerm>User:</DescriptionTerm>
            <DescriptionDetails>
              {reward?.user ? (
                <Link
                  href={`/users/user/${reward?.user?.id}`}
                  className="cursor-pointer text-[#665FD5] underline underline-offset-2"
                >
                  {reward?.user?.firstName ? `${reward.user.firstName} ${reward.user.lastName}` : 'View profile'}
                </Link>
              ) : (
                <p>-</p>
              )}
            </DescriptionDetails>
            <DescriptionTerm>Amount:</DescriptionTerm>
            <DescriptionDetails>{reward?.amount ? formatToUSD(reward.amount) : '-'}</DescriptionDetails>
            <DescriptionTerm>Reward Initiation Date:</DescriptionTerm>
            <DescriptionDetails>{reward ? format(reward.createdAt, 'MMMM d, yyyy') : '-'}</DescriptionDetails>
            <DescriptionTerm>Reward Approval Date:</DescriptionTerm>
            <DescriptionDetails>
              {reward?.dateApproved ? format(reward?.dateApproved, 'MMMM d, yyyy') : '-'}
            </DescriptionDetails>
          </DescriptionList>
        )}
      </div>
    </>
  )
}
