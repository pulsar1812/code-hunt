import { getUserAnswers } from '@/lib/actions/user.action'
import { SearchParamsProps } from '@/types'
import AnswerCard from '../card/AnswerCard'
import Pagination from './Pagination'

interface Props extends SearchParamsProps {
  userId: string
  clerkId?: string
}

export default async function AnswersTab({
  searchParams,
  userId,
  clerkId,
}: Props) {
  const result = await getUserAnswers({
    userId,
    page: searchParams.page ? +searchParams.page : 1,
  })

  return (
    <>
      {result.answers.map(({ _id, question, author, upvotes, createdAt }) => (
        <AnswerCard
          key={_id}
          _id={_id}
          question={question}
          author={author}
          upvotes={upvotes}
          createdAt={createdAt}
          clerkId={clerkId}
        />
      ))}

      <div className='mt-10 '>
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNext}
        />
      </div>
    </>
  )
}
