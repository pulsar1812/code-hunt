import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getQuestionById } from '@/lib/actions/question.action'
import { getUserById } from '@/lib/actions/user.action'
import QuestionForm from '@/components/forms/QuestionForm'
import { ParamsProps } from '@/types'

export default async function QuestionEditPage({ params }: ParamsProps) {
  // Get Clerk ID
  const { userId } = auth()

  if (!userId) redirect('/sign-in')

  const mongoUser = await getUserById({ userId })

  const question = await getQuestionById({ questionId: params.id })

  if (!question) redirect('/ask-question')

  return (
    <>
      <h1 className='h1-bold text-dark100_light900'>Edit Question</h1>

      <div className='mt-9'>
        <QuestionForm
          type='Edit'
          mongoUserId={mongoUser._id}
          questionDetails={JSON.stringify(question)}
        />
      </div>
    </>
  )
}
