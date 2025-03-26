'use client'
import { useGlobalContext } from '@/context/GlobalContext'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { setAccessToken } = useGlobalContext()
  const [redirectUser, setRedirectUser] = useState<'yes' | 'no' | 'pending'>('pending')

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const storedData = localStorage.getItem('mbxchange')
      const data = storedData ? JSON.parse(storedData) : null

      if (data?.accessToken) {
        setAccessToken(data.accessToken)
        setRedirectUser('no')
      } else setRedirectUser('yes')
    } catch (error) {
      console.error('Error parsing localStorage data:', error)
      setRedirectUser('yes')
    }
  }, [])

  if (redirectUser == 'pending') return <></>
  if (redirectUser == 'yes') return redirect('/login')
  return <>{children}</>
}
