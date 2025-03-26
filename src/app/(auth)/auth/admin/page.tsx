'use client'
import { redirect } from 'next/navigation'

export default function AdminRequestError() {
  redirect('/auth/admin/invite/error')
}
