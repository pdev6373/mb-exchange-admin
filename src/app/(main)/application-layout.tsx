'use client'
import { Sidebar, SidebarBody, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection } from '@/components/sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
import { Toaster } from '@/components/ui/toaster'
import { GlobalProvider } from '@/context/GlobalContext'
import { ChartBarIcon, GiftIcon, UsersIcon, WalletIcon } from '@heroicons/react/16/solid'
import { Cog6ToothIcon, HomeIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { AppLayout } from './applayout'
import Navbar from './navbar'

export function ApplicationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <Suspense fallback={<></>}>
      <GlobalProvider>
        <SidebarLayout
          navbar={<Navbar />}
          sidebar={
            <Sidebar>
              <SidebarHeader>
                <Image src={'/logo.png'} alt="logo" width={55} height={55} className="m-1.5" />
              </SidebarHeader>

              <SidebarBody>
                <SidebarSection className="gap-2.5">
                  <SidebarItem href="/" current={pathname === '/'}>
                    <HomeIcon />
                    <SidebarLabel>Dashboard</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/users" current={pathname.startsWith('/users')}>
                    <UsersIcon />
                    <SidebarLabel>Users</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/transactions" current={pathname.startsWith('/transactions')}>
                    <WalletIcon />
                    <SidebarLabel>Transactions</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/rewards" current={pathname.startsWith('/rewards')}>
                    <GiftIcon />
                    <SidebarLabel>Rewards</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/revenue" current={pathname.startsWith('/revenue')}>
                    <ChartBarIcon />
                    <SidebarLabel>Revenue</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/settings" current={pathname.startsWith('/settings')}>
                    <Cog6ToothIcon />
                    <SidebarLabel>Settings</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>
              </SidebarBody>
            </Sidebar>
          }
        >
          <AppLayout>{children}</AppLayout>
        </SidebarLayout>
        <Toaster />
      </GlobalProvider>
    </Suspense>
  )
}
