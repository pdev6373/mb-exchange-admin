'use client'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export const closeWindow = () => {
  if (typeof window == 'undefined') return
  window.close()
}

export default function page() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <Card className="max-w-[500px]">
        <CardHeader>
          <CardTitle>Invalid or Expired Token</CardTitle>
          <CardDescription>
            The token you provided is either invalid or has expired. Please check the link and try again.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex justify-end">
          <Button onClick={closeWindow}>Close Tab</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
