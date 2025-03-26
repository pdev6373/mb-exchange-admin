export type SetBoolean = React.Dispatch<React.SetStateAction<boolean>>
export type SetString = React.Dispatch<React.SetStateAction<string>>
export type SetNumber = React.Dispatch<React.SetStateAction<number>>
export type SetType<T> = React.Dispatch<React.SetStateAction<T>>
export type Pagination = {
  total: number
  page: number
  limit: number
  totalPages: number
}
