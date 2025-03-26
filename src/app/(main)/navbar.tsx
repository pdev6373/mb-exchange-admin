'use client'
import { Navbar as Nav, NavbarSection, NavbarSpacer } from '@/components/navbar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useGlobalContext } from '@/context/GlobalContext'
import Link from 'next/link'

export default function Navbar() {
  const { admin } = useGlobalContext()

  return (
    <Nav>
      <NavbarSpacer />
      <NavbarSection>
        <Link href={'/profile'} className="py-2">
          <Avatar>
            <AvatarFallback>{admin?.name[0]}</AvatarFallback>
          </Avatar>
        </Link>
      </NavbarSection>
    </Nav>
  )
}
