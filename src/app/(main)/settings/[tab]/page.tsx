'use client'
import AdminManagement from '@/components/page/AdminManagement'
import Assets from '@/components/page/Assets'
import Notifications from '@/components/page/Notifications'
import { Slug } from '@/types'

type SettingsType = {
  children?: JSX.Element
  params: { tab: Slug }
}

export default function Settings({ params }: SettingsType) {
  return (
    <div className="flex grow flex-col">
      {params.tab === 'admin-management' ? (
        <AdminManagement />
      ) : params.tab === 'notifications' ? (
        <Notifications />
      ) : params.tab === 'assets' ? (
        <Assets />
      ) : (
        <></>
      )}
    </div>
  )
}
