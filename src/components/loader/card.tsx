import { Button } from '../ui/button'
import Line from './line'

type Card = {
  amount?: number
}

export const NotificationLoader = ({ amount = 3 }: Card) => {
  return (
    <div className="mt-10 flex animate-pulse flex-col justify-between gap-7">
      <Button
        className="ml-auto bg-gray-200 text-transparent shadow-none dark:bg-gray-700 sm:shrink-0"
        style={{
          paddingInline: 20,
        }}
      >
        Send New Announcement
      </Button>

      <div
        className={`grid gap-4 sm:gap-6`}
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(24em, 100%), 1fr))',
        }}
      >
        {Array.from({ length: amount })?.map((_, index, arr) => (
          <div
            className={`flex flex-col justify-between gap-6 rounded-[8px] p-4 shadow sm:p-6 ${arr?.length < 2 ? 'max-w-[500px]' : ''}`}
            key={index}
          >
            <div className="flex flex-col gap-1.5">
              <Line styles="h-5 w-[75%] rounded-md" />
              <Line styles="h-10 w-full" />
            </div>

            <Line styles="h-5 w-[55%] rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
