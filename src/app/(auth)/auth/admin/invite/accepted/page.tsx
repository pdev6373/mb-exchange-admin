'use client'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function page() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <Card className="max-w-[500px]">
        <CardHeader>
          <CardTitle>Action Completed</CardTitle>
          <CardDescription>
            You have successfully completed the action. You can click the button below to login.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex justify-end">
          <Button
            onClick={() => {
              localStorage?.removeItem('mbxchange')
              router.replace('/login')
            }}
          >
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
