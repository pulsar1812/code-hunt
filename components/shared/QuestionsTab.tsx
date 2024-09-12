import { getUserQuestions } from '@/lib/actions/user.action'
import { SearchParamsProps } from '@/types'
import QuestionCard from '../card/QuestionCard'
import Pagination from './Pagination'

interface Props extends SearchParamsProps {
  userId: string
  clerkId?: string | null
}

export default async function QuestionsTab({
  searchParams,
  userId,
  clerkId,
}: Props) {
  const result = await getUserQuestions({
    userId,
    page: searchParams.page ? +searchParams.page : 1,
  })

  return (
    <>
      {result.questions.map(
        ({ _id, title, tags, author, upvotes, answers, views, createdAt }) => (
          <QuestionCard
            key={_id}
            _id={_id}
            title={title}
            tags={tags}
            author={author}
            upvotes={upvotes}
            answers={answers}
            views={views}
            createdAt={createdAt}
            clerkId={clerkId}
          />
        )
      )}

      <div className='mt-10 '>
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNext}
        />
      </div>
    </>
  )
}
