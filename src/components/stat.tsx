import { Badge } from '@/components/badge'
import { Divider } from '@/components/divider'

export default function Stat({
  title,
  value,
  change,
  loading = false,
  description = 'from last week',
  isGreen = false,
}: {
  title: string
  value: number | string | undefined
  change?: string
  loading?: boolean
  description?: string
  isGreen?: boolean
}) {
  return loading ? (
    <div className="animate-pulse">
      <Divider />
      <div className="mt-7 h-3 w-14 rounded-[2px] bg-gray-200 dark:bg-gray-700" />
      <div className="mt-1 h-5 w-24 rounded-[2px] bg-gray-200 dark:bg-gray-700" />{' '}
      <div className="mt-1 h-4 w-36 rounded-[2px] bg-gray-200 dark:bg-gray-700" />
      <div className="mt-1 h-10 w-48 rounded-md bg-gray-200 dark:bg-gray-700" />
    </div>
  ) : (
    <div>
      <Divider />

      <div className="mt-6 text-lg/6 font-medium sm:text-sm/6">{title}</div>
      <div className="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{value}</div>
      {change ? (
        <div className="mt-3 text-sm/6 sm:text-xs/6">
          <Badge color={change.startsWith('+') ? 'lime' : isGreen ? 'lime' : 'pink'}>{change}</Badge>{' '}
          <span className="text-zinc-500">{description}</span>
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}
