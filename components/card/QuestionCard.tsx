import Link from 'next/link'
import { SignedIn } from '@clerk/nextjs'

import RenderTag from '../shared/RenderTag'
import Metric from '../shared/Metric'
import AvatarBlock from './AvatarBlock'
import { formatAndDivideNumber, getTimestamp } from '@/lib/utils'
import EditDeleteAction from '../shared/EditDeleteAction'

export type QuestionCardProps = {
  _id: string
  title: string
  tags: {
    _id: string
    name: string
  }[]
  author: {
    _id: string
    name: string
    picture: string
    clerkId: string
  }
  upvotes: Array<object>
  answers: Array<object>
  views: number
  createdAt: Date
  clerkId?: string | null
}

export default function QuestionCard({
  _id,
  title,
  tags,
  author,
  upvotes,
  answers,
  views,
  createdAt,
  clerkId,
}: QuestionCardProps) {
  const showActionButtons = clerkId && clerkId === author.clerkId

  return (
    <div className='card-wrapper rounded-[10px] px-[45px] py-9'>
      <div className='flex flex-col-reverse items-start justify-between gap-5 sm:flex-row'>
        <div>
          <span className='subtle-regular text-dark400_light700 flex sm:hidden'>
            {getTimestamp(createdAt)}
          </span>
          <Link href={`/question/${_id}`}>
            <h3 className='base-semibold sm:h3-semibold text-dark200_light900 line-clamp-1'>
              {title}
            </h3>
          </Link>
        </div>

        <SignedIn>
          {showActionButtons && (
            <EditDeleteAction type='Question' itemId={JSON.stringify(_id)} />
          )}
        </SignedIn>
      </div>

      <div className='mt-3.5 flex flex-wrap gap-2'>
        {tags.map((tag) => (
          <RenderTag key={tag._id} _id={tag._id} name={tag.name} />
        ))}
      </div>

      <div className='flex-between mt-6 w-full flex-wrap gap-3'>
        <AvatarBlock
          author={author}
          href={`/profile/${author._id}`}
          createdAt={createdAt}
        />
        <div className='flex items-center gap-3 max-sm:flex-wrap max-sm:justify-start'>
          <Metric
            imgUrl='/assets/icons/like.svg'
            alt='Like Icon'
            value={formatAndDivideNumber(upvotes.length)}
            title=' Votes'
          />
          <Metric
            imgUrl='/assets/icons/message.svg'
            alt='Message Icon'
            value={formatAndDivideNumber(answers.length)}
            title=' Answers'
          />
          <Metric
            imgUrl='/assets/icons/eye.svg'
            alt='Eye Icon'
            value={formatAndDivideNumber(views)}
            title=' Views'
          />
        </div>
      </div>
    </div>
  )
}
