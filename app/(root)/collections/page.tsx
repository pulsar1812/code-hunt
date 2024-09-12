import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

import QuestionCard, { QuestionCardProps } from '@/components/card/QuestionCard'
import Filter from '@/components/shared/Filter'
import NoResult from '@/components/shared/NoResult'
import LocalSearchbar from '@/components/shared/search/LocalSearchbar'
import { questionFilters } from '@/constants/filters'
import { getSavedQuestions } from '@/lib/actions/user.action'
import { SearchParamsProps } from '@/types'
import Pagination from '@/components/shared/Pagination'

export default async function CollectionsPage({
  searchParams,
}: SearchParamsProps) {
  // Get Clerk ID
  const { userId } = auth()

  if (!userId) redirect('/sign-in')

  const result = await getSavedQuestions({
    clerkId: userId,
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: searchParams.page ? +searchParams.page : 1,
  })

  return (
    <>
      <h1 className='h1-bold text-dark100_light900'>Saved Questions</h1>
      <div className='mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center'>
        <LocalSearchbar
          route='/collections'
          iconPosition='left'
          placeholder='Search saved questions here...'
          otherClasses='flex-1'
        />

        <Filter
          filters={questionFilters}
          otherClasses='min-h-[56px] sm:min-w-[170px]'
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
            title='There’s no saved question to show'
            description='Save questions for future reference. Build your own knowledge base here.'
            link='/'
            linkTitle='Save a Question'
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
