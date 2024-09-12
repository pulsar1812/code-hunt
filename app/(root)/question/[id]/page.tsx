import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getQuestionById } from '@/lib/actions/question.action'
import Metric from '@/components/shared/Metric'
import { formatAndDivideNumber, getTimestamp } from '@/lib/utils'
import ParseHTML from '@/components/shared/ParseHTML'
import RenderTag from '@/components/shared/RenderTag'
import AnswerForm from '@/components/forms/AnswerForm'
import { getUserById } from '@/lib/actions/user.action'
import AllAnswers from '@/components/shared/AllAnswers'
import Votes from '@/components/shared/Votes'

export default async function QuestionDetailsPage({
  params,
  searchParams,
}: any) {
  // Get Clerk ID
  const { userId } = auth()

  if (!userId) redirect('/sign-in')

  const mongoUser = await getUserById({ userId })

  const question = await getQuestionById({ questionId: params.id })

  if (!question) redirect('/ask-question')

  return (
    <>
      <div className='flex-start w-full flex-col'>
        <div className='flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2'>
          <Link
            href={`/profile/${question.author.clerkId}`}
            className='flex items-center justify-start gap-1'
          >
            <Image
              src={question.author.picture}
              alt='Profile'
              width={22}
              height={22}
              className='rounded-full'
            />
            <p className='paragraph-semibold text-dark300_light700'>
              {question.author.name}
            </p>
          </Link>

          <div className='flex justify-end'>
            <Votes
              type='Question'
              userId={JSON.stringify(mongoUser._id)}
              itemId={JSON.stringify(question._id)}
              upvotes={question.upvotes.length}
              downvotes={question.downvotes.length}
              hasUpvoted={question.upvotes.includes(mongoUser._id)}
              hasDownvoted={question.downvotes.includes(mongoUser._id)}
              hasSaved={mongoUser?.saved.includes(question._id)}
            />
          </div>
        </div>

        <h2 className='h2-semibold text-dark200_light900 mt-3.5 w-full text-left'>
          {question.title}
        </h2>
      </div>

      <div className='flex-start mb-8 mt-6 flex-wrap gap-3'>
        <Metric
          imgUrl='/assets/icons/clock.svg'
          alt='Clock Icon'
          value={` asked ${getTimestamp(question.createdAt)}`}
          title=''
        />
        <Metric
          imgUrl='/assets/icons/message.svg'
          alt='Message Icon'
          value={formatAndDivideNumber(question.answers.length)}
          title=' Answers'
        />
        <Metric
          imgUrl='/assets/icons/eye.svg'
          alt='Eye Icon'
          value={formatAndDivideNumber(question.views)}
          title=' Views'
        />
      </div>

      <ParseHTML data={question.content} />

      <div className='mt-8 flex flex-wrap gap-2'>
        {question.tags.map((tag: any) => (
          <RenderTag key={tag._id} _id={tag._id} name={tag.name} />
        ))}
      </div>

      <AllAnswers
        questionId={question._id}
        userId={mongoUser._id}
        totalAnswers={question.answers.length}
        page={searchParams?.page}
        filter={searchParams?.filter}
      />

      <AnswerForm
        questionContent={question.content}
        questionId={JSON.stringify(question._id)}
        authorId={JSON.stringify(mongoUser._id)}
      />
    </>
  )
}
