import { TableCell, TableRow } from '../table'

type Table = {
  colspan?: number
}

export default function LoadingTable({ colspan = 6 }: Table) {
  return (
    <TableRow className="animate-pulse">
      <TableCell rowSpan={1} colSpan={colspan}>
        <div className={`h-10 w-full rounded-md bg-gray-200 dark:bg-gray-700`} />
      </TableCell>
    </TableRow>
  )
}
