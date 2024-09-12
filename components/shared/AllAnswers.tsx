import Link from 'next/link'
import Image from 'next/image'

import { getAnswers } from '@/lib/actions/answer.action'
import ParseHTML from './ParseHTML'
import Filter from './Filter'
import { answerFilters } from '@/constants/filters'
import { getTimestamp } from '@/lib/utils'
import Votes from './Votes'

type Props = {
  questionId: string
  userId: string
  totalAnswers: number
  page?: number
  filter?: string
}

export default async function AllAnswers({
  questionId,
  userId,
  totalAnswers,
  page,
  filter,
}: Props) {
  const result = await getAnswers({
    questionId,
    page: page ? +page : 1,
    sortBy: filter,
  })

  // console.log(userId)
  // console.log(JSON.stringify(userId))

  return (
    <div className='mt-11'>
      <div className='flex items-center justify-between'>
        <h3 className='primary-text-gradient'>{totalAnswers} Answers</h3>

        <Filter filters={answerFilters} />
      </div>

      <div>
        {result.answers.length > 0 ? (
          result.answers.map((answer) => (
            <article key={answer._id} className='light-border border-b py-10'>
              <div className='mb-8 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2'>
                <Link
                  href={`/profile/${answer.author.clerkId}`}
                  className='flex flex-1 items-start gap-1 sm:items-center'
                >
                  <Image
                    src={answer.author.picture}
                    alt='Profile'
                    width={18}
                    height={18}
                    className='rounded-full object-cover max-sm:mt-0.5'
                  />
                  <div className='flex flex-col sm:flex-row sm:items-center'>
                    <p className='body-semibold text-dark300_light700'>
                      {answer.author.name}
                    </p>
                    <p className='small-regular text-light400_light500 ml-0.5 mt-0.5 line-clamp-1'>
                      answered {getTimestamp(answer.createdAt)}
                    </p>
                  </div>
                </Link>

                <div className='flex justify-end'>
                  <Votes
                    type='Answer'
                    userId={JSON.stringify(userId)}
                    itemId={JSON.stringify(answer._id)}
                    upvotes={answer.upvotes.length}
                    downvotes={answer.downvotes.length}
                    hasUpvoted={answer.upvotes.includes(userId)}
                    hasDownvoted={answer.downvotes.includes(userId)}
                  />
                </div>
              </div>

              <ParseHTML data={answer.content} />
            </article>
          ))
        ) : (
          <div>No answers yet</div>
        )}
      </div>
    </div>
  )
}
