import Image from 'next/image'
import Link from 'next/link'

import RenderTag from '../shared/RenderTag'
import { getTopInteractedTags } from '@/lib/actions/tag.action'
import { Badge } from '../ui/badge'

type UserCardProps = {
  user: {
    _id: string
    clerkId: string
    name: string
    username: string
    picture: string
  }
}

export default async function UserCard({ user }: UserCardProps) {
  const interactedTags = await getTopInteractedTags({ userId: user._id })

  return (
    <div className='shadow-light100_darknone w-full max-xs:min-w-full xs:w-[260px]'>
      <article className='background-light900_dark200 flex-center light-border w-full flex-col rounded-xl border p-8'>
        <Image
          src={user.picture}
          alt='User Profile Picture'
          width={100}
          height={100}
          className='rounded-full'
        />

        <Link href={`/profile/${user.clerkId}`} className='mt-4 text-center'>
          <h3 className='h3-bold text-dark200_light900 line-clamp-1'>
            {user.name}
          </h3>
          <p className='body-regular text-dark500_light500 mt-2'>
            @{user.username}
          </p>
        </Link>

        <div className='mt-5'>
          {interactedTags.length > 0 ? (
            <div className='flex items-center gap-2'>
              {interactedTags.map((tag) => (
                <RenderTag key={tag._id} _id={tag._id} name={tag.name} />
              ))}
            </div>
          ) : (
            <Badge>No tags yet</Badge>
          )}
        </div>
      </article>
    </div>
  )
}
