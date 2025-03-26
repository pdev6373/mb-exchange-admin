type Line = {
  styles?: string
}

export default function Line({ styles }: Line) {
  return <div className={`inline-block h-10 rounded-md bg-gray-200 dark:bg-gray-700 ${styles} animate-pulse`} />
}
