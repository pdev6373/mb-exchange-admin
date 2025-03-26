import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useApiRequest } from '@/hooks/useApiRequest'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, LoaderIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'

type Crypto = {
  id: string
  name: string
  symbol: string
  image: string
  current_price: number
  total_volume: number
  platforms: object
}

type FetchedCryptoDetails = {
  id: string
  symbol: string
  name: string
  asset_platform_id: string | null
  platforms: Record<string, string>
  detail_platforms: Record<
    string,
    {
      decimal_place: number | null
      contract_address: string
    }
  >
  description: {
    en: string
  }
}

type PlatformAddress = {
  platform: string
  address: string
}

type CryptoSelector = {
  onAddCrypto: () => void
}

export default function CryptoSelector({ onAddCrypto }: CryptoSelector) {
  const [cryptos, setCryptos] = useState<Crypto[]>([])
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [platformAddresses, setPlatformAddresses] = useState<PlatformAddress[]>([])
  const [nativeAddress, setNativeAddress] = useState<string>('')
  const [rate, setRate] = useState('')
  const [vipRate, setVipRate] = useState('')
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false)
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [cryptoData, setCryptoData] = useState<FetchedCryptoDetails>()
  const [fetchingData, setFetchingData] = useState(false)
  const { apiRequest: addAsset, loading: addingAsset } = useApiRequest()

  const hasPlatforms = cryptoData && Object.keys(cryptoData.platforms).some((key) => key !== '')

  const isFormValid = () => {
    if (!selectedCrypto) return false

    if (hasPlatforms) {
      if (selectedPlatforms.length === 0) return false
      const allPlatformsHaveAddresses = selectedPlatforms.every((platform) =>
        platformAddresses.some((pl) => pl.platform === platform && pl.address.trim() !== '')
      )
      return allPlatformsHaveAddresses && rate !== ''
    } else return nativeAddress.trim() !== '' && rate !== ''
  }

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=${page}`
        )
        const data = await response.json()
        setCryptos((prev) => (page === 1 ? data : [...prev, ...data]))
      } finally {
        setLoading(false)
      }
    }
    fetchCryptos()
  }, [page])

  const fetchCryptoData = async (id: string) => {
    try {
      setFetchingData(true)
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`)
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

      setSelectedPlatforms([])
      setPlatformAddresses([])
      setNativeAddress('')
      setRate('')
    } finally {
      setFetchingData(false)
    }
  }

  const handlePlatformChange = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms((prev) => prev.filter((p) => p !== platform))
      setPlatformAddresses((prev) => prev.filter((pl) => pl.platform !== platform))
    } else {
      setSelectedPlatforms((prev) => [...prev, platform])
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
    const response = await addAsset({
      url: '/assets',
      method: 'POST',
      data: {
        cryptoId: selectedCrypto?.id,
        name: selectedCrypto?.name,
        symbol: selectedCrypto?.symbol,
        image: selectedCrypto?.image,
        rate: Number(rate) || undefined,
        vipRate: Number(vipRate) || undefined,
        description: cryptoData?.description?.en,
        hasPlatforms,
        isActive: true,
        platformAddresses: hasPlatforms
          ? platformAddresses.filter((pl) => selectedPlatforms.includes(pl.platform))
          : [{ platform: 'native', address: nativeAddress }],
      },
      showToast: true,
    })

    if (response.success) {
      onAddCrypto()
      setIsSheetOpen(false)
      setCryptoData(undefined)
      setSelectedCrypto(null)
      setSelectedPlatforms([])
      setPlatformAddresses([])
      setNativeAddress('')
      setRate('')
      setVipRate('')
    }
  }

  const handleNextPage = () => setPage((prev) => prev + 1)

  const showAddressSection = !fetchingData && selectedCrypto
  const showRateSection = showAddressSection && ((hasPlatforms && selectedPlatforms.length > 0) || !hasPlatforms)

  return (
    <div>
      <Button onClick={() => setIsSheetOpen(true)}>Add Asset</Button>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="flex max-h-screen flex-col overflow-y-scroll">
          <SheetHeader>
            <SheetTitle>Add New Asset</SheetTitle>
            <SheetDescription>Select a cryptocurrency, choose platforms, and add a rate.</SheetDescription>
          </SheetHeader>

          <div className="mt-4">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-medium">Select Asset:</h3>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between py-4 text-sm"
                  >
                    {selectedCrypto ? (
                      <div className="flex items-center gap-1.5">
                        <img src={selectedCrypto.image} alt="crypto image" width={24} />
                        {selectedCrypto.name} ({selectedCrypto.symbol.toUpperCase()})
                      </div>
                    ) : (
                      'Select a crypto currency...'
                    )}
                    <ChevronsUpDown className="opacity-50" size={16} />
                  </Button>
                </div>
              </PopoverTrigger>

              <PopoverContent className="m-0 w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search cryptocurrency..."
                    className="h-9 w-full border-0 ring-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                  />
                  <CommandList>
                    <CommandEmpty>No crypto found in this list</CommandEmpty>
                    <CommandGroup>
                      {cryptos.map((crypto) => (
                        <CommandItem
                          key={crypto.id}
                          value={crypto.id}
                          onSelect={(currentValue) => {
                            const newValue = currentValue === selectedCrypto?.id ? selectedCrypto : crypto
                            setSelectedCrypto(newValue)
                            fetchCryptoData(newValue.id)
                            setOpen(false)
                          }}
                        >
                          <img src={crypto.image} alt="crypto image" width={24} />
                          {crypto.name} ({crypto.symbol.toUpperCase()})
                          <Check
                            className={cn('ml-auto', selectedCrypto?.id === crypto.id ? 'opacity-100' : 'opacity-0')}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <div className="mt-1 p-2">
                      <Button onClick={handleNextPage} className="w-full">
                        {loading ? (
                          <div className="py-1">
                            <LoaderIcon className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          'Load More'
                        )}
                      </Button>
                    </div>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {fetchingData && (
            <div className="flex h-full items-center justify-center p-6">
              <LoaderIcon className="h-5 w-5 animate-spin" />
            </div>
          )}

          {showAddressSection && hasPlatforms && (
            <div className="mt-4 space-y-3">
              <h3 className="text-sm font-medium">Select Platforms:</h3>
              <div className="flex flex-col gap-3">
                {Object.keys(cryptoData.platforms).map(
                  (platform) =>
                    platform !== '' && (
                      <div key={platform}>
                        <div className="flex cursor-pointer items-center space-x-2">
                          <Checkbox
                            id={platform}
                            checked={selectedPlatforms.includes(platform)}
                            onCheckedChange={() => handlePlatformChange(platform)}
                          />
                          <label htmlFor={platform} className="py-1 text-sm">
                            {platform}
                          </label>
                        </div>

                        {selectedPlatforms.includes(platform) && (
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
          )}

          {showAddressSection && !hasPlatforms && (
            <div className="mt-4 space-y-1.5">
              <h3 className="text-sm font-medium">Enter Address:</h3>
              <Input
                placeholder="Enter wallet address"
                value={nativeAddress}
                onChange={handleNativeAddressChange}
                className="w-full"
              />
            </div>
          )}

          {showRateSection && (
            <>
              <div className="mt-4 space-y-1.5">
                <h3 className="text-sm font-medium">Add Rate (In Naira):</h3>
                <Input
                  placeholder="Enter rate"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="mt-4 space-y-1.5">
                <h3 className="text-sm font-medium">Add Vip Rate (In Naira) (Optional):</h3>
                <Input
                  placeholder="Enter vip rate"
                  value={vipRate}
                  onChange={(e) => setVipRate(e.target.value)}
                  className="w-full"
                />
              </div>
            </>
          )}

          <div className="mt-auto">
            <Button onClick={handleSubmit} className="mt-6 w-full" disabled={!isFormValid()}>
              {addingAsset ? (
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
    </div>
  )
}
