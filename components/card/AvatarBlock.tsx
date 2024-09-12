import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getTimestamp } from '@/lib/utils'

type AvatarProps = {
  author: {
    _id: string
    name: string
    picture: string
  }
  href: string
  createdAt: Date
}

export default function AvatarBlock({ author, href, createdAt }: AvatarProps) {
  return (
    <Link href={href} className='flex-center gap-1'>
      <Avatar className='h-[20px] w-[20px]'>
        <AvatarImage src={author.picture} alt='User' />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <p className='text-dark400_light700 body-medium px-4'>{author.name}</p>

      <p className='text-dark400_light800 small-regular line-clamp-1 max-sm:hidden'>
        • asked {getTimestamp(createdAt)}
      </p>
    </Link>
  )
}
