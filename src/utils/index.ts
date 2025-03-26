export const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout

  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId)

    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

export const convertDecimalToHoursAndMinutes = (hoursDecimal: number) => {
  const hours = Math.floor(hoursDecimal)
  const minutes = Math.round((hoursDecimal - hours) * 60)
  if (minutes === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`
  return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes.toString().padStart(2, '0')} minutes`
}
