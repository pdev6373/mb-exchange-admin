'use client'
import { Toaster } from '@/components/ui/toaster'
import { useApiRequest } from '@/hooks/useApiRequest'
import { ILogin } from '@/types/models/admin'
import { LoaderIcon } from 'lucide-react'
import Image from 'next/image'
import { redirect, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [redirectUser, setRedirectUser] = useState<'yes' | 'no' | 'pending'>('pending')
  const { apiRequest, loading } = useApiRequest<ILogin>()

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const storedData = localStorage.getItem('mbxchange')
      const data = storedData ? JSON.parse(storedData) : null

      if (!data?.accessToken) setRedirectUser('no')
      else setRedirectUser('yes')
    } catch (error) {
      console.error('Error parsing localStorage data:', error)
      setRedirectUser('no')
    }
  }, [])

  const loginHandler = async () => {
    const response = await apiRequest({
      url: '/admin-auth/login',
      data: {
        email,
        password,
      },
      method: 'POST',
      showToast: true,
    })
    if (response.success) {
      if (typeof window === 'undefined') return
      localStorage?.setItem('mbxchange', JSON.stringify(response.data))
      router.replace('/')
    }
  }

  if (redirectUser == 'pending') return <></>
  if (redirectUser == 'yes') return redirect('/')

  return (
    <>
      <div className="flex min-h-full flex-1 grow flex-col justify-center px-6 py-14">
        <div className="flex flex-col items-center">
          <Image src={'/logo.png'} alt="logo" width={120} height={120} className="p-5" />
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              loginHandler()
            }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-1.5">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-[#ccc] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#333] sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
              <div className="mt-1.5">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-[#ccc] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#333] sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <button
              disabled={!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email) || !password}
              type="submit"
              className="flex w-full cursor-pointer justify-center rounded-md bg-[#272727] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm transition-all hover:bg-opacity-85"
            >
              {loading ? (
                <div className="py-1">
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
      <Toaster />
    </>
  )
}
