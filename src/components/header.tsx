import { Heading } from './heading'
import Profile from './profile'

type HeadingType = {
  heading: string
}

export default function Header({ heading }: HeadingType) {
  return (
    <div className="flex items-center justify-between gap-5">
      <Heading>{heading}</Heading>

      <Profile />
    </div>
  )
}
