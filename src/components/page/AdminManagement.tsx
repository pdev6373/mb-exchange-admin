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
import { useGlobalContext } from '@/context/GlobalContext'
import { useApiRequest } from '@/hooks/useApiRequest'
import { Role } from '@/types/enums'
import { IAdmin, RoleType } from '@/types/models/admin'
import { format } from 'date-fns'
import { LoaderIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '../badge'
import { Dialog } from '../dialog'
import { Heading } from '../heading'
import LoadingTable from '../loader/table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../table'
import { Text } from '../text'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

export default function AdminManagement() {
  const [showDialog, setShowDialog] = useState(false)
  const [admins, setAdmins] = useState<IAdmin[]>([])
  const [toEdit, setToEdit] = useState<IAdmin>()
  const [toDelete, setToDelete] = useState<IAdmin>()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<RoleType>('admin')
  const { admin } = useGlobalContext()
  const { apiRequest: getAdmins, loading: gettingAdmins } = useApiRequest<IAdmin[]>()
  const { apiRequest: addAdmin, loading: addingAdmin } = useApiRequest<IAdmin[]>()
  const { apiRequest: updateAdmin, loading: updatingAdmin } = useApiRequest<IAdmin[]>()
  const { apiRequest: removeAdmin, loading: removingAdmin } = useApiRequest<IAdmin[]>()

  const getAllAdmins = async () => {
    const response = await getAdmins({
      url: '/admin/all',
    })
    if (response.success) setAdmins(response.data || [])
  }

  const addAnAdmin = async () => {
    const response = await addAdmin({
      url: '/admin',
      method: 'POST',
      data: {
        name,
        email,
        role,
      },
      showToast: true,
    })
    if (response.success) {
      getAllAdmins()
      setShowDialog(false)
      setName('')
      setEmail('')
      setRole('admin')
    }
  }

  const updateAnAdmin = async () => {
    const response = await updateAdmin({
      url: `/admin/${toEdit?._id}`,
      method: 'PATCH',
      data: {
        role,
        name,
      },
      showToast: true,
    })
    if (response.success) {
      getAllAdmins()
      setToEdit(undefined)
    }
    setRole('admin')
    setName('')
  }

  const removeAnAdmin = async () => {
    const response = await removeAdmin({
      url: `/admin/${toDelete?._id}`,
      method: 'DELETE',
      showToast: true,
    })
    if (response.success) getAllAdmins()
    setToDelete(undefined)
  }

  useEffect(() => {
    getAllAdmins()
  }, [])

  return (
    <>
      <AlertDialog open={!!toDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="capitalize">{`Remove ${toDelete?.name} as ${toDelete?.role}?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {`This action will remove ${toDelete?.name} as ${toDelete?.role} from our server, and can't be reversible, click cancel to abort.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setToDelete(undefined)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive"
              onClick={removeAnAdmin}
            >
              {removingAdmin ? (
                <div className="py-1">
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                'Remove'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        className="overflow-x-hidden bg-[#FBFBFB]"
        open={!!showDialog}
        onClose={() => {
          setShowDialog(false)
          setRole('admin')
          setName('')
          setEmail('')
        }}
        children={
          <div>
            <div className="relative">
              <Heading className="-mt-2 mb-4">Add Admin</Heading>
              <div className="absolute left-[-200px] right-[-200px] h-[1px] bg-[#E4E4E7]" />
            </div>

            <div>
              <Text className="mb-4 pt-5 text-black">Fill in admin information</Text>

              <div className="flex flex-col gap-4">
                <div className="grid w-full items-center gap-1">
                  <Label className="text-sm text-[#0E1728]">Name</Label>
                  <Input
                    placeholder="Enter full name"
                    className="bg-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid w-full items-center gap-1">
                  <Label className="text-sm text-[#0E1728]">Email Address</Label>
                  <Input
                    placeholder="Enter email address"
                    className="bg-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="grid w-full items-center gap-1">
                  <Label className="text-sm text-[#0E1728]">Role</Label>
                  <Select onValueChange={(val: RoleType) => setRole(val)} value={role} defaultValue={'admin'}>
                    <SelectTrigger className="gap-2">
                      <SelectValue defaultValue={'admin'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.values(Role)
                          .filter((role) => role !== 'superadmin')
                          .map((role) => (
                            <SelectItem value={role}>{role}</SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              <Button
                onClick={addAnAdmin}
                disabled={
                  !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email) || !name.trim() || addingAdmin || !role
                }
              >
                {addingAdmin ? (
                  <div className="py-1">
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  'Add'
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowDialog(false)
                  setName('')
                  setEmail('')
                  setRole('admin')
                }}
                variant={'ghost'}
              >
                Cancel
              </Button>
            </div>
          </div>
        }
      />

      <Dialog
        className="overflow-x-hidden bg-[#FBFBFB]"
        open={!!toEdit}
        onClose={() => {
          setToEdit(undefined)
          setRole('admin')
          setName('')
        }}
        children={
          <div>
            <div className="relative">
              <Heading className="-mt-2 mb-4 capitalize">Edit Admin</Heading>
              <div className="absolute left-[-200px] right-[-200px] h-[1px] bg-[#E4E4E7]" />
            </div>

            <div>
              <Text className="mb-4 pt-5 text-black">Fill in admin information</Text>

              <div className="flex flex-col gap-4">
                <div className="grid w-full items-center gap-1">
                  <Label className="text-sm text-[#0E1728]">Name</Label>
                  <Input
                    placeholder={toEdit?.name}
                    className="bg-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid w-full items-center gap-1">
                  <Label className="text-sm text-[#0E1728]">Role</Label>
                  <Select onValueChange={(val: RoleType) => setRole(val)} defaultValue={toEdit?.role}>
                    <SelectTrigger className="gap-2">
                      <SelectValue defaultValue={toEdit?.role} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.values(Role)
                          .filter((role) => role !== 'superadmin')
                          .map((role) => (
                            <SelectItem value={role}>{role}</SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              <Button
                onClick={updateAnAdmin}
                disabled={!role || !name.trim() || (role == toEdit?.role && name == toEdit.name)}
              >
                {updatingAdmin ? (
                  <div className="py-1">
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  'Update'
                )}
              </Button>
              <Button
                onClick={() => {
                  setToEdit(undefined)
                  setRole('admin')
                }}
                variant={'ghost'}
              >
                Cancel
              </Button>
            </div>
          </div>
        }
      />

      {admin?.role === 'superadmin' ? (
        <div className="mt-10 flex flex-wrap items-center justify-end gap-5">
          <Button
            className="shrink-0"
            style={{
              paddingInline: 20,
            }}
            onClick={() => {
              setName('')
              setRole('admin')
              setEmail('')
              setShowDialog(true)
            }}
          >
            Add Admin
          </Button>
        </div>
      ) : (
        <div className="mt-5" />
      )}

      <div>
        <Table className="mt-4 rounded-[8px]">
          <TableHead>
            <TableRow>
              <TableHeader>Admin Name</TableHeader>
              <TableHeader>Email Address</TableHeader>
              <TableHeader>Role</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Date Added</TableHeader>
              {admin?.role === 'superadmin' ? <TableHeader>Actions</TableHeader> : <></>}
            </TableRow>
          </TableHead>

          <TableBody>
            {gettingAdmins
              ? Array.from({ length: 3 }).map((_, index) => (
                  <LoadingTable key={index} colspan={admin?.role === 'superadmin' ? 6 : 5} />
                ))
              : admins
                  ?.sort((a, b) => {
                    if (a.role === 'superadmin' && b.role !== 'superadmin') return -1
                    if (b.role === 'superadmin' && a.role !== 'superadmin') return 1
                    return 0
                  })
                  .map((adminData) => (
                    <TableRow key={adminData._id} href={undefined}>
                      <TableCell>
                        <p className="">{adminData.name}</p>
                      </TableCell>
                      <TableCell>{adminData.email}</TableCell>
                      <TableCell className="capitalize">
                        {adminData?.role === 'superadmin' ? 'Super Admin' : adminData.role}
                      </TableCell>
                      <TableCell className="capitalize">
                        <Badge color={adminData?.isActive ? 'green' : 'zinc'} className="capitalize">
                          {adminData?.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {adminData?.role === 'superadmin' ? '-' : format(adminData.createdAt, 'MMM d, yyyy')}
                      </TableCell>
                      {admin?.role === 'superadmin' ? (
                        <TableCell>
                          {adminData?.role !== 'superadmin' ? (
                            <div className="flex items-center gap-1.5">
                              <span
                                onClick={() => {
                                  setName(adminData?.name)
                                  setRole(adminData?.role)
                                  setToEdit(adminData)
                                }}
                                className="cursor-pointer text-xs font-medium text-[#0E1728]"
                              >
                                Edit
                              </span>{' '}
                              <span className="text-sm text-[#B2B2B2]">|</span>{' '}
                              <span
                                className="cursor-pointer text-xs font-medium text-[#DC2626]"
                                onClick={() => setToDelete(adminData)}
                              >
                                Remove
                              </span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      ) : (
                        <></>
                      )}
                    </TableRow>
                  ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
