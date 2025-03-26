'use client'
import { Badge } from '@/components/badge'
import { Heading } from '@/components/heading'
import Profile from '@/components/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGlobalContext } from '@/context/GlobalContext'
import { useApiRequest } from '@/hooks/useApiRequest'
import { IAdmin } from '@/types/models/admin'
import { LoaderIcon } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const [changePassword, setChangePassword] = useState(false)
  const [edit, setEdit] = useState(false)
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { admin, setAdmin } = useGlobalContext()
  const { apiRequest: getAdmin, loading: gettingAdmin } = useApiRequest()
  const { apiRequest: updateAdmin, loading: updatingAdmin } = useApiRequest<IAdmin>()
  const { apiRequest: updatePassword, loading: updatingPassword } = useApiRequest<IAdmin>()

  useEffect(() => {
    ;(async () => {
      const response = await getAdmin({
        url: '/admin',
      })
      if (response.success) setAdmin(response.data)
    })()
  }, [])

  const updateAdminDetails = async () => {
    const response = await updateAdmin({
      url: '/admin',
      method: 'PATCH',
      showToast: true,
      data: {
        name,
      },
    })
    if (response.success) {
      setAdmin(response.data)
      setEdit(false)
    }
    setName('')
  }

  const updateAdminPassword = async () => {
    const response = await updatePassword({
      url: '/admin/password',
      method: 'PATCH',
      showToast: true,
      data: {
        oldPassword: currentPassword,
        newPassword: newPassword,
      },
    })

    if (response.success) setChangePassword(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  if (gettingAdmin)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoaderIcon className="h-4 w-4 animate-spin" />
      </div>
    )

  return (
    <>
      <div className="flex items-center justify-between gap-5">
        <Heading>Profile Settings</Heading>

        <Profile />
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <p className="font-semibold text-black">Manage Profile</p>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-8 rounded-[16px] px-6 py-7 shadow">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <p className="font-semibold text-black">Personal Information</p>
              <div>
                {edit ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      onClick={() => {
                        setEdit(false)
                        setName('')
                      }}
                      variant={'ghost'}
                    >
                      Cancel
                    </Button>
                    <Button onClick={updateAdminDetails} disabled={updatingAdmin || !name.trim()}>
                      {updatingAdmin ? (
                        <div className="py-1">
                          <LoaderIcon className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                ) : (
                  <Badge
                    color="transparent"
                    className="cursor-pointer rounded-[300px] px-3 py-1.5"
                    style={{
                      border: '1px solid #49657B',
                    }}
                    onClick={() => setEdit(true)}
                  >
                    <p className="text-xs text-[#49657B]">Edit</p>
                    <Image src="/svgs/edit.svg" alt="edit icon" height={12} width={12} />
                  </Badge>
                )}
              </div>
            </div>

            <div
              className={`grid gap-6 sm:gap-9`}
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(21em, 100%), 1fr))',
              }}
            >
              {edit ? (
                <>
                  <>
                    <div className="grid w-full items-center gap-1">
                      <Label className="text-sm text-[#0E1728]">Name</Label>
                      <Input
                        placeholder={admin?.name}
                        className="h-10 bg-white"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div />
                  </>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-[#8F9499]">Name</p>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{admin?.name}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-[#8F9499]">Email Address</p>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{admin?.email}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-[#8F9499]">Role</p>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{admin?.role}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-8 rounded-[16px] px-6 py-7 shadow">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <p className="font-semibold text-black">Security</p>
              <div>
                {changePassword ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      onClick={() => {
                        setChangePassword(false)
                        setCurrentPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                      }}
                      variant={'ghost'}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={updateAdminPassword}
                      disabled={
                        updatingPassword ||
                        !currentPassword.trim() ||
                        !newPassword.trim() ||
                        confirmPassword.trim() !== newPassword.trim()
                      }
                    >
                      {updatingPassword ? (
                        <div className="py-1">
                          <LoaderIcon className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                ) : (
                  <Badge
                    color="transparent"
                    className="cursor-pointer rounded-[300px] px-3 py-2"
                    style={{
                      border: '1px solid #49657B',
                    }}
                    onClick={() => setChangePassword(true)}
                  >
                    <p className="text-xs text-[#49657B]">Change Password</p>
                  </Badge>
                )}
              </div>
            </div>

            <div
              className={`grid gap-6 sm:gap-9`}
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(21em, 100%), 1fr))',
              }}
            >
              {changePassword ? (
                <>
                  <div className="grid w-full items-center gap-1">
                    <Label className="text-sm text-[#0E1728]">Current Password</Label>
                    <Input
                      placeholder="***********************"
                      className="h-10 bg-white pt-0.5"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div />

                  <div className="grid w-full items-center gap-1">
                    <Label className="text-sm text-[#0E1728]">New Password</Label>
                    <Input
                      className="h-10 bg-white pt-0.5"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="grid w-full items-center gap-1">
                    <Label className="text-sm text-[#0E1728]">Confirm New Password</Label>
                    <Input
                      className="h-10 bg-white pt-0.5"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid w-full items-center gap-1">
                    <Label className="text-sm text-[#0E1728]">Password</Label>
                    <Input
                      disabled
                      type="password"
                      value={'*********************'}
                      className="h-10 w-full rounded bg-[#F5F8FA80] pt-0.5 text-gray-600"
                    />
                  </div>
                  <div />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
