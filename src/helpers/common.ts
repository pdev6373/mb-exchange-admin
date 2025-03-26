export function getCurrentMonth() {
  const date = new Date()
  const index = date.getMonth()
  const number = index + 1

  const names = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const name = names[index]

  return {
    name,
    number,
  }
}

export function formatToUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

type AllowedValue = string | number | boolean | null | undefined | Date
type DataRow = {
  [key: string]: AllowedValue
}

const stringifyValue = (value: AllowedValue): string => {
  if (value === null || value === undefined) return ''

  if (typeof value === 'string') {
    const escaped = value.replace(/"/g, '""')
    return /[,"]/.test(value) ? `"${escaped}"` : value
  }

  return String(value)
}

const convertToCSV = <T extends DataRow>(data: T[]): string => {
  if (!data?.length) return ''

  const header = Object.keys(data[0])
  const csvRows = [
    header.join(','),
    ...data.map((row) => header.map((fieldName) => stringifyValue(row[fieldName])).join(',')),
  ]

  return csvRows.join('\n')
}

const downloadFile = (content: string, filename: string, fileType: 'csv' | 'xls'): void => {
  const mimeTypes = {
    csv: 'text/csv;charset=utf-8',
    xls: 'application/vnd.ms-excel;charset=utf-8',
  }

  const BOM = fileType === 'xls' ? '\uFEFF' : ''
  const blob = new Blob([BOM + content], { type: mimeTypes[fileType] })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.${fileType}`)
  document.body.appendChild(link)

  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportToCSV = <T extends DataRow>(data: T[], filename: string = 'export'): void =>
  downloadFile(convertToCSV(data), filename, 'csv')

export const exportToExcel = <T extends DataRow>(data: T[], filename: string = 'export'): void =>
  downloadFile(convertToCSV(data), filename, 'xls')

// function isDateInFutureOrToday(endDate: Date) {
//   const today = new Date()

//   if (isBefore(endDate, today)) return false
//   return true
// }
