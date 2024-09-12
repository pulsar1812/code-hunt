import Link from 'next/link'
import { SignedIn } from '@clerk/nextjs'

import Metric from '../shared/Metric'
import AvatarBlock from './AvatarBlock'
import { formatAndDivideNumber, getTimestamp } from '@/lib/utils'
import EditDeleteAction from '../shared/EditDeleteAction'

type AnswerCardProps = {
  _id: string
  question: {
    _id: string
    title: string
  }
  author: {
    _id: string
    name: string
    picture: string
    clerkId: string
  }
  upvotes: Array<object>
  createdAt: Date
  clerkId?: string
}

export default function AnswerCard({
  _id,
  question,
  author,
  upvotes,
  createdAt,
  clerkId,
}: AnswerCardProps) {
  const showActionButtons = clerkId && clerkId === author.clerkId

  return (
    <Link href={`/question/${question._id}/#${_id}`}>
      <div className='card-wrapper rounded-[10px] px-[45px] py-9'>
        <div className='flex flex-col-reverse items-start justify-between gap-5 sm:flex-row'>
          <div>
            <span className='subtle-regular text-dark400_light700 flex sm:hidden'>
              {getTimestamp(createdAt)}
            </span>
            <h3 className='base-semibold sm:h3-semibold text-dark200_light900 line-clamp-1'>
              {question.title}
            </h3>
          </div>

          <SignedIn>
            {showActionButtons && (
              <EditDeleteAction type='Answer' itemId={JSON.stringify(_id)} />
            )}
          </SignedIn>
        </div>

        <div className='flex-between mt-6 w-full flex-wrap gap-3'>
          <AvatarBlock
            author={author}
            href={`/profile/${author._id}`}
            createdAt={createdAt}
          />

          <Metric
            imgUrl='/assets/icons/like.svg'
            alt='Like Icon'
            value={formatAndDivideNumber(upvotes.length)}
            title=' Votes'
          />
        </div>
      </div>
    </Link>
  )
}
