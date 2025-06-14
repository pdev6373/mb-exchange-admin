import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useApiRequest } from '@/hooks/useApiRequest'
import { IAsset } from '@/types/models/asset'
import { ChevronsUpDown, LoaderIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'

type FetchedCryptoDetails = {
  id: string
  symbol: string
  name: string
  asset_platform_id?: string
  platforms?: Record<string, string>
  detail_platforms?: Record<
    string,
    {
      decimal_place: number | null
      contract_address: string
    }
  >
  description: {
    en?: string
  }
}

type PlatformAddress = {
  platform: string
  address: string
}

type CryptoSelector = {
  onEditCrypto: () => void
  crypto: IAsset
  isOpen?: boolean
  onClose: () => void
}

export default function CryptoUpdate({ crypto, onEditCrypto, onClose, isOpen = false }: CryptoSelector) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    crypto?.hasPlatforms ? crypto.platformAddresses?.map((platform) => platform.platform) || [] : []
  )
  const [platformAddresses, setPlatformAddresses] = useState<PlatformAddress[]>(crypto.platformAddresses)
  const [nativeAddress, setNativeAddress] = useState<string>(
    crypto?.platformAddresses.find((address) => address.platform == 'native')?.address || ('' as string)
  )
  console.log('sss', crypto)
  const [rate, setRate] = useState(crypto.rate.toString())
  const [ngnRate, setNgnRate] = useState(crypto.ngnRate?.toString())
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(isOpen)
  const [cryptoData, setCryptoData] = useState<FetchedCryptoDetails | undefined>()
  const [fetchingData, setFetchingData] = useState(false)
  const { apiRequest: updateAsset, loading: updatingAsset } = useApiRequest<IAsset>()
  const [isActive, setIsActive] = useState(crypto.isActive)

  const hasPlatforms = cryptoData && Object.keys(cryptoData.platforms ?? {}).some((key) => key !== '')

  const isFormValid = () => {
    if (hasPlatforms) {
      if (selectedPlatforms?.length === 0) return false
      const allPlatformsHaveAddresses = selectedPlatforms?.every((platform) =>
        platformAddresses.some((pl) => pl.platform === platform && pl.address.trim() !== '')
      )
      return allPlatformsHaveAddresses && rate !== ''
    } else return nativeAddress.trim() !== '' && rate !== ''
  }

  useEffect(() => {
    fetchCryptoData()
  }, [])

  useEffect(() => {
    setIsSheetOpen(isOpen)
  }, [isOpen])

  const fetchCryptoData = async () => {
    try {
      setFetchingData(true)
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${crypto.cryptoId}`)
      const data = (await response.json()) as FetchedCryptoDetails
      setCryptoData({
        asset_platform_id: data.asset_platform_id,
        description: {
          en: data.description.en,
        },
        detail_platforms: data.detail_platforms,
        id: data.id,
        name: data.name,
        platforms: data.platforms,
        symbol: data.symbol,
      })
    } finally {
      setFetchingData(false)
    }
  }

  const handlePlatformChange = (platform: string) => {
    if (selectedPlatforms?.includes(platform)) {
      setSelectedPlatforms((prev) => prev?.filter((p) => p !== platform))
      setPlatformAddresses((prev) => prev?.filter((pl) => pl.platform !== platform))
    } else {
      setSelectedPlatforms((prev) => (prev ? [...prev, platform] : []))
      setPlatformAddresses((prev) => [...prev, { platform, address: '' }])
    }
  }

  const handlePlatformAddressChange = (platform: string, address: string) => {
    setPlatformAddresses((prev) => {
      const existing = prev.find((pl) => pl.platform === platform)
      if (existing) return prev.map((pl) => (pl.platform === platform ? { ...pl, address } : pl))
      else return [...prev, { platform, address }]
    })
  }

  const handleNativeAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => setNativeAddress(e.target.value)

  const handleSubmit = async () => {
    const response = await updateAsset({
      url: `/assets/${crypto._id}`,
      method: 'PATCH',
      data: {
        rate: Number(rate) || undefined,
        ngnRate: Number(ngnRate) || undefined,
        platforms: hasPlatforms ? cryptoData?.platforms : undefined,
        isActive,
        platformAddresses: hasPlatforms
          ? platformAddresses.filter((pl) => selectedPlatforms?.includes(pl.platform))
          : [{ platform: 'native', address: nativeAddress }],
      },
      showToast: true,
    })

    if (response.success) {
      onEditCrypto()
      setIsSheetOpen(false)
      setCryptoData(undefined)
      setSelectedPlatforms([])
      setPlatformAddresses([])
      setNativeAddress('')
      setRate('')
      setNgnRate('')
    }
  }

  return (
    <Sheet
      open={isSheetOpen}
      onOpenChange={(open) => {
        setIsSheetOpen(open)
        if (!open) onClose()
      }}
    >
      <SheetContent className="flex max-h-screen flex-col overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>Add New Asset</SheetTitle>
          <SheetDescription>Select a cryptocurrency, choose networks, and add a rate.</SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          <Button variant="outline" role="combobox" className="w-full justify-between py-4 text-sm" disabled>
            <div className="flex items-center gap-1.5">
              <img src={crypto.image} alt="crypto image" width={24} />
              {crypto.name} ({crypto.symbol.toUpperCase()})
            </div>

            <ChevronsUpDown className="opacity-50" size={16} />
          </Button>
        </div>

        {fetchingData && (
          <div className="flex h-full items-center justify-center p-6">
            <LoaderIcon className="h-5 w-5 animate-spin" />
          </div>
        )}

        {hasPlatforms ? (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-medium">Select Networks:</h3>
            <div className="flex flex-col gap-3">
              {Object.keys(cryptoData.platforms ?? {})?.map(
                (platform) =>
                  platform !== '' && (
                    <div key={platform}>
                      <div className="flex cursor-pointer items-center space-x-2">
                        <Checkbox
                          id={platform}
                          checked={selectedPlatforms?.includes(platform)}
                          onCheckedChange={() => handlePlatformChange(platform)}
                        />
                        <label htmlFor={platform} className="py-1 text-sm">
                          {platform}
                        </label>
                      </div>

                      {selectedPlatforms?.includes(platform) && (
                        <div className="mt-2 pl-6">
                          <Input
                            placeholder={`Enter ${platform} address`}
                            value={platformAddresses.find((pl) => pl.platform === platform)?.address || ''}
                            onChange={(e) => handlePlatformAddressChange(platform, e.target.value)}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  )
              )}
            </div>
          </div>
        ) : (
          <></>
        )}

        {!hasPlatforms ? (
          <div className="mt-4 space-y-1.5">
            <h3 className="text-sm font-medium">Enter Address:</h3>
            <Input
              placeholder="Enter wallet address"
              value={nativeAddress}
              onChange={handleNativeAddressChange}
              className="w-full"
            />
          </div>
        ) : (
          <></>
        )}

        <div className="mt-4 space-y-1.5">
          <h3 className="text-sm font-medium">Add Rate (In Naira):</h3>
          <Input
            placeholder="Enter rate"
            value={ngnRate}
            onChange={(e) => setNgnRate(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex cursor-pointer items-center space-x-2">
          <Checkbox id="status" checked={isActive} onCheckedChange={() => setIsActive((prev) => !prev)} />
          <label htmlFor="status" className="py-1 text-sm">
            Active
          </label>
        </div>

        <div className="mt-auto">
          <Button onClick={handleSubmit} className="mt-6 w-full" disabled={!isFormValid()}>
            {updatingAsset ? (
              <div className="py-1">
                <LoaderIcon className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
