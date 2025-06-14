import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useApiRequest } from '@/hooks/useApiRequest'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, LoaderIcon, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type Crypto = {
  id: string
  name: string
  symbol: string
  image: string
  current_price: number
  total_volume: number
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
  const [platformAddresses, setPlatformAddresses] = useState<PlatformAddress[]>([])
  const [networkName, setNetworkName] = useState<string>('')
  const [networkAddress, setNetworkAddress] = useState<string>('')
  const [rate, setRate] = useState('')
  const [ngnRate, setNgnRate] = useState('')
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false)
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const { apiRequest: addAsset, loading: addingAsset } = useApiRequest()

  const hasPlatforms = platformAddresses.length > 0

  const isFormValid = () => {
    if (!selectedCrypto) return false

    if (hasPlatforms) {
      const allPlatformsHaveAddresses = platformAddresses.every(
        (pl) => pl.platform.trim() !== '' && pl.address.trim() !== ''
      )
      return allPlatformsHaveAddresses && rate !== '' && ngnRate !== ''
    } else {
      // Require at least one network
      return platformAddresses.length > 0 && rate !== '' && ngnRate !== ''
    }
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

  const handleAddNetwork = () => {
    if (networkName.trim() !== '' && networkAddress.trim() !== '') {
      setPlatformAddresses((prev) => [...prev, { platform: networkName, address: networkAddress }])
      setNetworkName('')
      setNetworkAddress('')
    }
  }

  const handleRemoveNetwork = (index: number) => {
    setPlatformAddresses((prev) => prev.filter((_, i) => i !== index))
  }

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
        ngnRate: Number(ngnRate) || undefined,
        description: '',
        hasPlatforms: true,
        isActive: true,
        platformAddresses: platformAddresses.length > 0 ? platformAddresses : [{ platform: 'native', address: '' }],
      },
      showToast: true,
    })

    if (response.success) {
      onAddCrypto()
      setIsSheetOpen(false)
      setSelectedCrypto(null)
      setPlatformAddresses([])
      setNetworkName('')
      setNetworkAddress('')
      setRate('')
      setNgnRate('')
    }
  }

  const handleNextPage = () => setPage((prev) => prev + 1)

  const showNetworkSection = selectedCrypto !== null
  const showRateSection = showNetworkSection

  return (
    <div>
      <Button onClick={() => setIsSheetOpen(true)}>Add Asset</Button>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="flex max-h-screen flex-col overflow-y-scroll">
          <SheetHeader>
            <SheetTitle>Add New Asset</SheetTitle>
            <SheetDescription>Select a cryptocurrency, add networks manually, and set rates.</SheetDescription>
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

          {showNetworkSection && (
            <div className="mt-4 space-y-3">
              <h3 className="text-sm font-medium">Add Networks:</h3>

              {/* List of added networks */}
              {platformAddresses.length > 0 && (
                <div className="mb-3 space-y-2">
                  {platformAddresses.map((platform, index) => (
                    <div key={index} className="flex items-center justify-between rounded-md border p-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{platform.platform}</span>
                        <span className="max-w-52 truncate text-xs text-gray-500">{platform.address}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveNetwork(index)}>
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new network form */}
              <div className="flex flex-col space-y-2">
                <Input
                  placeholder="Network name (e.g. Ethereum, BSC)"
                  value={networkName}
                  onChange={(e) => setNetworkName(e.target.value)}
                  className="w-full"
                />
                <Input
                  placeholder="Wallet address"
                  value={networkAddress}
                  onChange={(e) => setNetworkAddress(e.target.value)}
                  className="w-full"
                />
                <Button
                  variant="outline"
                  onClick={handleAddNetwork}
                  disabled={networkName.trim() === '' || networkAddress.trim() === ''}
                  className="w-full"
                >
                  <Plus size={16} className="mr-2" /> Add Network
                </Button>
              </div>
            </div>
          )}

          {showRateSection && (
            <>
              <div className="mt-4 space-y-1.5">
                <h3 className="text-sm font-medium">Add Rate (In Naira):</h3>
                <Input
                  placeholder="Enter naira rate"
                  value={ngnRate}
                  onChange={(e) => setNgnRate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="mt-4 space-y-1.5">
                <h3 className="text-sm font-medium">Add Rate (In Dollars):</h3>
                <Input
                  placeholder="Enter dollar rate"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
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
