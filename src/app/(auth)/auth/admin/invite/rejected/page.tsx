'use client'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { closeWindow } from '../error/page'

export default function AdminRejected() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <Card className="max-w-[500px]">
        <CardHeader>
          <CardTitle>Action Completed</CardTitle>
          <CardDescription>You have successfully completed the action. You can now close this tab.</CardDescription>
        </CardHeader>

        <CardFooter className="flex justify-end">
          <Button onClick={closeWindow}>Close Tab</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
