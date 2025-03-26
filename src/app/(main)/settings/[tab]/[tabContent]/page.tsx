'use client'
import { Badge } from '@/components/badge'
import { useGlobalContext } from '@/context/GlobalContext'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import axios from 'axios'
import { format } from 'date-fns'
import { LoaderIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Content({ params }: { params: { tabContent: string } }) {
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [showSend, setShowSend] = useState(true)

  const [gettingSupports, setGettingSupports] = useState(true)
  const [support, setSupport] = useState<{
    id: string
    createdAt: Date
    details: string
    status: 'closed' | 'open'
    topic: string
    firstName: string
    lastName: string
  }>()
  const { accessToken } = useGlobalContext()

  useEffect(() => {
    ;(async () => {
      try {
        setGettingSupports(true)
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/contact-support`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (response?.data.status)
          setSupport(
            response.data.data.find(
              (support: {
                id: string
                createdAt: Date
                details: string
                status: 'closed' | 'open'
                topic: string
                firstName: string
                lastName: string
              }) => support.id === params.tabContent
            )
          )
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setGettingSupports(false)
      }
    })()
  }, [])

  if (gettingSupports)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoaderIcon className="h-4 w-4 animate-spin" />
      </div>
    )

  if (!support?.id) return <></>

  return (
    <div className="mt-3 flex max-w-[596px] grow flex-col gap-8">
      <Link
        href="/settings/support-requests"
        className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400"
      >
        <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
        Back to Support Tickets
      </Link>

      <div className="flex flex-col gap-12">
        <div className="flex flex-wrap items-center gap-2">
          <p className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FCC5CE] text-sm capitalize text-[#5C1E27]">
            {support?.firstName ? `${support?.firstName[0]}${support?.lastName[0]}` : ''}
          </p>

          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold capitalize text-[#18181B]">{`${support?.firstName} ${support?.lastName}`}</p>

            <div className="flex items-center">
              <p className="text-xs text-[#9A9CAD]">
                {support?.createdAt ? format(support.createdAt, "MMM d, yyyy '・' h:mma") : '-'}
              </p>
            </div>
          </div>

          <Badge color="green" className="ml-5 border border-[#00995180] px-3 capitalize">
            {support?.status}
          </Badge>
        </div>

        <div className="flex flex-col items-start gap-6">
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-[#18181B]">Subject</p>
            <p className="text-sm">{support?.topic}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="font-semibold text-[#18181B]">Content</p>
            <p className="text-sm">{support?.details}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
