'use client'
import { redirect } from 'next/navigation'

export default function page() {
  return redirect('/auth/admin/invite/error')
}
