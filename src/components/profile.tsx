'use client'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useGlobalContext } from '@/context/GlobalContext'
import { useApiRequest } from '@/hooks/useApiRequest'
import { ChevronDownIcon, LoaderIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Avatar, AvatarFallback } from './ui/avatar'

export default function Profile() {
  const { admin } = useGlobalContext()
  const [showAlert, setShowAlert] = useState(false)
  const router = useRouter()
  const { apiRequest, loading } = useApiRequest()

  const logoutHandler = async () => {
    const response = await apiRequest({
      url: '/admin-auth/logout',
    })
    if (response.success) {
      localStorage?.removeItem('mbxchange')
      router.replace('/login')
    }
  }

  return (
    <div className="hidden lg:flex">
      <AlertDialog open={showAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove your data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAlert(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive"
              onClick={logoutHandler}
            >
              {loading ? (
                <div className="py-1">
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                'Logout'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="flex min-w-0 items-center gap-3">
              <Avatar>
                <AvatarFallback>{admin?.name[0]}</AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                  {admin?.name}
                </span>
                <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                  {admin?.email}
                </span>
              </span>
            </span>
            <ChevronDownIcon width={20} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-[8px]">
          <Link href={'/profile'}>
            <DropdownMenuItem>My Account</DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowAlert(true)}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
