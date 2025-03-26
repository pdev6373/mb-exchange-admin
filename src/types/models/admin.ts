import { Role } from '../enums/index'

export type RoleType = `${Role}`

export interface IAdmin {
  _id: string
  email: string
  name: string
  role: RoleType
  invitationToken?: string
  invitationExpires?: Date
  isActive: boolean
  createdAt: Date
}

export interface ILogin {
  accessToken: string
  refreshToken: string
}
