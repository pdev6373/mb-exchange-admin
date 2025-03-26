'use client'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'
import { ITEM_TYPES, createUltimatePagination } from 'react-ultimate-pagination'

interface PaginationProps {
  totalItems: number
  currentPage: number
  setCurrentPage: (value: number) => void
  totalPages: number
  rowsPerPage: number
  setRowsPerPage: (value: number) => void
}

const PaginationComponent: React.FC<PaginationProps> = ({
  totalItems,
  currentPage,
  totalPages,
  rowsPerPage,
  setRowsPerPage,
  setCurrentPage,
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const handlePageChange = (pageNumber: number) => {
    if (typeof window === 'undefined') return

    setCurrentPage(pageNumber)

    const params = new URLSearchParams(searchParams as any)
    params.set('page', pageNumber.toString())
    params.set('rowsPerPage', rowsPerPage.toString())
    router.push(`${window.location.pathname}?${params.toString()}`)
  }

  const handleRowsChange = (val: string) => {
    const newRowsPerPage = parseInt(val)
    setRowsPerPage(newRowsPerPage)

    const params = new URLSearchParams(searchParams as any)
    params.set('page', '1')
    params.set('rowsPerPage', newRowsPerPage.toString())
    router.push(`${window.location.pathname}?${params.toString()}`)
  }

  const Page: React.FC<{ value: number; isActive: boolean; onClick: () => void }> = ({ value, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`mx-1 min-h-[38px] min-w-[38px] items-center justify-center rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-800 disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-600 dark:text-white dark:focus:bg-neutral-500 ${isActive ? 'bg-gray-300' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
    >
      {value}
    </button>
  )

  const Ellipsis: React.FC = () => <span className="px-3 py-1 text-gray-500">...</span>

  const PreviousPageLink: React.FC<{ isDisabled: boolean; onClick: () => void }> = ({ isDisabled, onClick }) => (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className="mr-auto inline-flex min-h-[38px] min-w-[75px] items-center justify-center gap-x-1.5 rounded-lg py-2 text-sm text-gray-800 hover:opacity-80 disabled:pointer-events-none disabled:opacity-50 dark:text-white"
      aria-label="Previous"
    >
      <svg
        className="size-3.5 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m15 18-6-6 6-6"></path>
      </svg>
      <span>Previous</span>
    </button>
  )

  const NextPageLink: React.FC<{ isDisabled: boolean; onClick: () => void }> = ({ isDisabled, onClick }) => (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className="ml-auto inline-flex min-h-[38px] min-w-[75px] items-center justify-center gap-x-1.5 rounded-lg py-2 text-sm text-gray-800 hover:opacity-80 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white"
      aria-label="Next"
    >
      <span>Next</span>
      <svg
        className="size-3.5 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m9 18 6-6-6-6"></path>
      </svg>
    </button>
  )

  const PaginationComponent = createUltimatePagination({
    itemTypeToComponent: {
      [ITEM_TYPES.PAGE]: Page,
      [ITEM_TYPES.ELLIPSIS]: Ellipsis,
      [ITEM_TYPES.FIRST_PAGE_LINK]: () => <></>,
      [ITEM_TYPES.PREVIOUS_PAGE_LINK]: () => <></>,
      [ITEM_TYPES.NEXT_PAGE_LINK]: () => <></>,
      [ITEM_TYPES.LAST_PAGE_LINK]: () => <></>,
    },
  })

  const startItem = (currentPage - 1) * rowsPerPage + 1
  const endItem = Math.min(totalItems, currentPage * rowsPerPage)

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-gray-700">Rows per page:</p>

          <Select value={rowsPerPage.toString()} onValueChange={handleRowsChange}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ul className="mt-5 flex w-full flex-row flex-wrap items-center justify-between gap-5">
        <PreviousPageLink isDisabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} />
        <div className="hidden sm:block">
          <PaginationComponent currentPage={currentPage} totalPages={totalPages} onChange={handlePageChange} />
        </div>
        <NextPageLink isDisabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} />
      </ul>
    </div>
  )
}

export default function Pagination({
  totalItems,
  currentPage,
  totalPages,
  rowsPerPage,
  setRowsPerPage,
  setCurrentPage,
}: PaginationProps) {
  return (
    <Suspense fallback={<></>}>
      <PaginationComponent
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        setCurrentPage={setCurrentPage}
        setRowsPerPage={setRowsPerPage}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </Suspense>
  )
}
