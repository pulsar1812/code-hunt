import QuestionCard, { QuestionCardProps } from '@/components/card/QuestionCard'
import NoResult from '@/components/shared/NoResult'
import Pagination from '@/components/shared/Pagination'
import LocalSearchbar from '@/components/shared/search/LocalSearchbar'
import { getQuestionsByTagId } from '@/lib/actions/tag.action'
import { URLProps } from '@/types'

export default async function TagDetailsPage({
  params,
  searchParams,
}: URLProps) {
  const result = await getQuestionsByTagId({
    tagId: params.id,
    searchQuery: searchParams.q,
    page: searchParams.page ? +searchParams.page : 1,
  })

  return (
    <>
      <h1 className='h1-bold text-dark100_light900'>{result.tagTitle}</h1>
      <div className='mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center'>
        <LocalSearchbar
          route={`/tags/${params.id}`}
          iconPosition='left'
          placeholder='Search tag questions...'
          otherClasses='flex-1'
        />
      </div>

      <div className='mt-10 flex w-full flex-col gap-6'>
        {result.questions.length > 0 ? (
          result.questions.map(
            (
              question: QuestionCardProps // QuestionCardProps is added just to solve the type error on tags and author for now
            ) => (
              <QuestionCard
                key={question._id}
                _id={question._id}
                title={question.title}
                tags={question.tags}
                author={question.author}
                upvotes={question.upvotes}
                answers={question.answers}
                views={question.views}
                createdAt={question.createdAt}
              />
            )
          )
        ) : (
          <NoResult
            title='There’s no related question to show'
            description='Be the first to break the silence! 🚀 Ask a Question and kickstart the
            discussion. our query could be the next big thing others learn from.
            Get involved! 💡'
            link='/ask-question'
            linkTitle='Ask a Question'
          />
        )}
      </div>

      <div className='mt-10 '>
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNext}
        />
      </div>
    </>
  )
}
