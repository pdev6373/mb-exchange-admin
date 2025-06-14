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
import { useApiRequest } from '@/hooks/useApiRequest'
import { IAsset } from '@/types/models/asset'
import { LoaderIcon, Search } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Badge } from '../badge'
import CryptoSelector from '../crypto-selector'
import CryptoUpdate from '../crypto-update'
import LoadingTable from '../loader/table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../table'
import { Input } from '../ui/input'

export const formatNumber = (number: number) => {
  const roundedNumber = Math.abs(Math.floor(number * 100) / 100)
  if (roundedNumber >= 1000)
    return `${roundedNumber.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  return `${roundedNumber.toFixed(2)}`
}

export default function Assets() {
  const [assets, setAssets] = useState<IAsset[]>()
  const [toUpdate, setToUpdate] = useState<IAsset>()
  const [search, setSearch] = useState('')
  const { apiRequest: getAssets, loading: gettingAssets } = useApiRequest<IAsset[]>()
  const { apiRequest: deleteAsset, loading: deletingAsset } = useApiRequest<IAsset[]>()
  const [toDelete, setToDelete] = useState<IAsset>()

  const getAssetsHandler = async () => {
    const response = await getAssets({
      url: '/assets',
    })
    if (response.success) setAssets(response.data)
  }

  const deleteAssetHandler = async () => {
    const response = await deleteAsset({
      url: `/assets/${toDelete?._id}`,
      method: 'DELETE',
      showToast: true,
    })
    if (response.success) {
      getAssetsHandler()
      setToDelete(undefined)
    }
  }

  useEffect(() => {
    getAssetsHandler()
  }, [])

  return (
    <>
      {toUpdate?.cryptoId ? (
        <CryptoUpdate
          crypto={toUpdate}
          onEditCrypto={() => getAssetsHandler()}
          isOpen={!!toUpdate}
          onClose={() => setToUpdate(undefined)}
        />
      ) : (
        <></>
      )}

      <AlertDialog open={!!toDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete {toDelete?.name} ({toDelete?.symbol})?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete {toDelete?.name} ({toDelete?.symbol}) asset and remove your data from
              our servers, and it is not reversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setToDelete(undefined)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive"
              onClick={deleteAssetHandler}
            >
              {deletingAsset ? (
                <div className="py-1">
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-5">
          <div className="relative">
            <Search className="absolute left-2 top-[50%] z-10 h-4 w-4 -translate-y-[50%] text-muted-foreground" />
            <Input placeholder="Search" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <CryptoSelector onAddCrypto={getAssetsHandler} />
        </div>

        <Table className="mt-4 rounded-[8px]">
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Symbol</TableHeader>
              <TableHeader>Icon</TableHeader>
              <TableHeader>Naira Rate</TableHeader>
              <TableHeader>Total Networks</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>

          <TableBody>
            {gettingAssets
              ? Array.from({ length: 5 }).map((_, index) => <LoadingTable key={index} colspan={9} />)
              : assets
                  ?.filter(
                    (asset) =>
                      asset?.name?.toLowerCase().trim().includes(search?.toLowerCase().trim()) ||
                      asset?.symbol?.toLowerCase().trim().includes(search?.toLowerCase().trim()) ||
                      asset?.ngnRate?.toString()?.toLowerCase().trim().includes(search?.toLowerCase().trim())
                  )
                  ?.map((asset) => (
                    <TableRow key={asset._id} href={undefined}>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>{asset.symbol.toUpperCase()}</TableCell>
                      <TableCell>
                        {asset?.image ? <Image src={asset.image} alt="asset icon" width={24} height={24} /> : '-'}
                      </TableCell>
                      <TableCell>{`₦${formatNumber(asset.ngnRate)}`}</TableCell>
                      <TableCell>{asset.platformAddresses?.length}</TableCell>
                      <TableCell>
                        {
                          <Badge color={asset?.isActive ? 'green' : 'zinc'} className="px-3.5 capitalize">
                            {asset?.isActive ? 'Active' : 'Disabled'}
                          </Badge>
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => setToUpdate(asset)}
                            className="cursor-pointer text-xs font-medium text-[#0E1728]"
                          >
                            Edit
                          </span>{' '}
                          <span className="text-sm text-[#B2B2B2]">|</span>{' '}
                          <span
                            className="cursor-pointer text-xs font-medium text-[#DC2626]"
                            onClick={() => setToDelete(asset)}
                          >
                            Remove
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
