'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApiRequest } from '@/hooks/useApiRequest'
import { jwtDecode } from 'jwt-decode'
import { LoaderIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

type Data = {
  email: string
  role: string
}

function InviteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [showAcceptAlert, setShowAcceptAlert] = useState<'pending' | 'yes' | 'no'>('pending')
  const [showCompleteSetup, setShowCompleteSetup] = useState(false)
  const [data, setData] = useState<Data | null>(null)
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const { apiRequest: acceptInvite, loading: acceptingInvite } = useApiRequest()
  const { apiRequest: rejectInvite, loading: rejectingInvite } = useApiRequest()
  const { apiRequest: confirmToken } = useApiRequest()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const tokenParam = searchParams.get('token')
    if (!tokenParam) return router.replace('/auth/admin/invite/error')
    ;(async () => {
      try {
        const decoded = jwtDecode<Data>(tokenParam)
        setToken(tokenParam)
        setData(decoded)

        const response = await confirmToken({
          url: `/admin-auth/accept-invite`,
          method: 'POST',
          data: { token: tokenParam },
        })

        if (response.success) {
          setShowAcceptAlert('yes')
        } else {
          router.replace('/auth/admin/invite/error')
        }
      } catch (e) {
        console.error('Error decoding token:', e)
        router.replace('/auth/admin/invite/error')
      }
    })()
  }, [searchParams, router])

  const acceptInviteHandler = async () => {
    const response = await acceptInvite({
      url: `/admin-auth/accept-invite`,
      method: 'POST',
      data: {
        token,
        action: 'accept',
        password,
      },
    })
    if (response.success) router.replace('/auth/admin/invite/accepted')
  }

  const rejectInviteHandler = async () => {
    const response = await rejectInvite({
      url: `/admin-auth/accept-invite`,
      method: 'POST',
      data: {
        token,
        action: 'reject',
      },
    })
    if (response.success) router.replace('/auth/admin/invite/rejected')
  }

  if (showAcceptAlert === 'pending' && !showCompleteSetup) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderIcon className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <AlertDialog open={showAcceptAlert === 'yes'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{'Admin invitation'}</AlertDialogTitle>
            <AlertDialogDescription>
              {`You have been invited as an ${data?.role} on MB Exchange. Click accept or reject to proceed.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-5">
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive"
              onClick={rejectInviteHandler}
            >
              {rejectingInvite ? (
                <div className="py-1">
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                'Reject'
              )}
            </AlertDialogAction>
            <AlertDialogAction
              className="bg-green-600 text-white hover:bg-green-600"
              onClick={() => {
                setShowAcceptAlert('no')
                setShowCompleteSetup(true)
              }}
            >
              Accept
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showCompleteSetup ? (
        <Card className="w-[450px]">
          <CardHeader>
            <CardTitle>Setup Password</CardTitle>
            <CardDescription>Setup your password to access the admin portal.</CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    placeholder="Create your password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    placeholder="Confirm password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              disabled={acceptingInvite || password.trim().length < 6 || password !== confirmPassword}
              onClick={acceptInviteHandler}
              className="flex items-center justify-center text-center"
            >
              {acceptingInvite ? (
                <div className="py-1">
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                'Set Password'
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : null}
    </div>
  )
}

export default function Invite() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <LoaderIcon className="h-4 w-4 animate-spin" />
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  )
}
