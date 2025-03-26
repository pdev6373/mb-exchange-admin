'use client'
import Header from '@/components/header'
import '@/styles/tailwind.css'
import { SettingsType, Slug } from '@/types'
import Link from 'next/link'

type Tab = {
  name: string
  slug: Slug
}

const tabs: Tab[] = [
  {
    name: 'Admin Management',
    slug: 'admin-management',
  },
  {
    name: 'Notifications',
    slug: 'notifications',
  },
  {
    name: 'Assets',
    slug: 'assets',
  },
]

export default function SettingsLayout({ children, params }: SettingsType) {
  return (
    <div className="flex grow flex-col">
      <Header heading="Settings" />

      <div className="mb-4 mt-14 overflow-hidden border-b border-gray-200 dark:border-gray-700">
        <ul className={`-mb-px flex overflow-x-auto text-center text-sm font-medium`} role="tablist">
          {tabs.map((tab) => (
            <li className="me-2 shrink-0" role="presentation" key={tab.name}>
              <Link
                href={`/settings/${tab.slug}`}
                className={`inline-block rounded-t-lg border-b-[3px] p-2 ${params.tab === tab.slug ? 'border-[#665FD5] text-[#665FD5] hover:text-[#665FD5] dark:border-purple-500 dark:text-purple-500 dark:hover:text-purple-500' : 'border-transparent text-gray-500 hover:border-transparent hover:text-gray-600 dark:border-gray-700 dark:border-transparent dark:text-gray-400 dark:hover:text-gray-300'}`}
                type="button"
                role="tab"
              >
                {tab.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex grow flex-col">{children}</div>
    </div>
  )
}
