'use client'
import { useApiRequest } from '@/hooks/useApiRequest'
import { Pagination as PaginationType } from '@/types/common'
import { INotification } from '@/types/models/notification'
import { format } from 'date-fns'
import { LoaderIcon } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Pagination from '../Pagination'
import { Dialog } from '../dialog'
import { Heading } from '../heading'
import { NotificationLoader } from '../loader/card'
import { Text } from '../text'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

export default function Notifications() {
  const [showDialog, setShowDialog] = useState(false)
  const [notifications, setNotifications] = useState<INotification[]>([])
  const [pagination, setPagination] = useState<PaginationType>()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const [rowsPerPage, setRowsPerPage] = useState<number>(parseInt(searchParams.get('rowsPerPage') || '10', 10))
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const { apiRequest: getNotifications, loading: gettingNotifications } = useApiRequest<{
    data: INotification[]
    pagination: PaginationType
  }>()
  const { apiRequest: addNotification, loading: addingNotification } = useApiRequest<INotification>()

  useEffect(() => {
    getAllNotifications()
  }, [rowsPerPage, currentPage])

  const getAllNotifications = async () => {
    const response = await getNotifications({
      url: '/admin/notifications',
      params: {
        limit: rowsPerPage,
        page: currentPage,
      },
    })
    if (response.success) {
      setNotifications(response.data?.data || [])
      setPagination(response.data?.pagination)
    }
  }

  const postNotifications = async () => {
    const response = await addNotification({
      url: '/admin/notifications',
      method: 'POST',
      data: {
        title,
        message,
      },
      showToast: true,
    })
    if (response.success) {
      setShowDialog(false)
      getAllNotifications()
    }
  }

  if (gettingNotifications) return <NotificationLoader amount={4} />

  return (
    <>
      <Dialog
        className="overflow-x-hidden bg-[#FBFBFB]"
        open={showDialog}
        onClose={() => setShowDialog(false)}
        children={
          <div>
            <div className="relative">
              <Heading className="-mt-2 mb-4">New Notification</Heading>
              <div className="absolute left-[-200px] right-[-200px] h-[1px] bg-[#E4E4E7]" />
            </div>

            <div>
              <Text className="mb-4 pt-5 text-black">Fill in notification information</Text>

              <div className="flex flex-col gap-4">
                <div className="grid w-full items-center gap-1">
                  <Label className="text-sm text-[#0E1728]">Title</Label>
                  <Input
                    placeholder="Enter notification title"
                    className="bg-white"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid w-full items-center gap-1">
                  <Label className="text-sm text-[#0E1728]">Message</Label>
                  <Textarea
                    placeholder="Write here"
                    className="min-h-[150px] border-[#D6D9DB] bg-white p-3 text-sm text-[#18181B]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              <Button disabled={!title.trim() || !message.trim()} onClick={postNotifications}>
                {addingNotification ? (
                  <div className="py-1">
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  'Send Notification'
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowDialog(false)
                  setTitle('')
                  setMessage('')
                }}
                variant={'ghost'}
              >
                Cancel
              </Button>
            </div>
          </div>
        }
      />

      {!notifications?.length ? (
        <div className="flex grow flex-col items-center justify-center gap-5 md:gap-4">
          <Image src={'/svgs/speaker.svg'} alt="notification" width={72} height={72} className="hidden md:block" />
          <Image src={'/svgs/speaker.svg'} alt="notification" width={56} height={56} className="md:hidden" />

          <div className="flex flex-col gap-3 md:gap-5">
            <p className="text-sm font-medium text-black">You have no notification</p>
            <Button className="cursor-pointer" onClick={() => setShowDialog(true)}>
              Send New Notification
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-10 flex flex-col justify-between gap-7">
          <Button
            className="ml-auto sm:shrink-0"
            style={{
              paddingInline: 20,
            }}
            onClick={() => setShowDialog(true)}
          >
            Send New Notification
          </Button>

          <div
            className={`grid gap-4 sm:gap-6`}
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(24em, 100%), 1fr))',
            }}
          >
            {notifications?.map((notification, index, arr) => (
              <div
                className={`flex flex-col justify-between gap-6 rounded-[8px] p-4 shadow sm:p-6 ${arr?.length < 2 ? 'max-w-[500px]' : ''}`}
                key={notification._id}
              >
                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-lg font-semibold text-black first-letter:uppercase">{notification.title}</p>
                    <p className="text-sm text-[#535353]">{notification.message}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-[#1A1A1A]">Sent:</p>&nbsp;
                    <p className="text-xs text-[#9A9CAD]">{format(notification.createdAt, 'MMM d, yyyy')}</p>
                    <p className="text-xs text-[#9A9CAD]">・</p>
                    <p className="text-xs text-[#9A9CAD]">{format(notification.createdAt, 'hh:mma')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {gettingNotifications ? (
        <></>
      ) : pagination && pagination?.totalPages > 1 ? (
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={pagination?.total}
          totalPages={pagination?.totalPages}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
        />
      ) : (
        <></>
      )}
    </>
  )
}
