import Link from 'next/link'
import type { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { Button } from '@/components/ui/button'

import LocalSearchbar from '@/components/shared/search/LocalSearchbar'
import HomeFilters from '@/components/home/HomeFilters'
import Filter from '@/components/shared/Filter'
import { homePageFilters } from '@/constants/filters'
import QuestionCard from '@/components/card/QuestionCard'
import NoResult from '@/components/shared/NoResult'
import {
  getQuestions,
  getRecommendedQuestions,
} from '@/lib/actions/question.action'
import { SearchParamsProps } from '@/types'
import Pagination from '@/components/shared/Pagination'

export const metadata: Metadata = {
  title: 'Home | Code Hunt',
  description: 'Home page of Code Hunt',
  icons: {
    icon: '/assets/images/site-logo.svg',
  },
}

// Don't need to create new states for getting search params, using only the URL is enough
export default async function Home({ searchParams }: SearchParamsProps) {
  const { userId } = auth()

  let result

  if (searchParams?.filter === 'recommended') {
    if (userId) {
      result = await getRecommendedQuestions({
        userId,
        searchQuery: searchParams.q,
        page: searchParams.page ? +searchParams.page : 1,
      })
    } else {
      result = {
        questions: [],
        isNext: false,
      }
    }
  } else {
    result = await getQuestions({
      searchQuery: searchParams.q,
      filter: searchParams.filter,
      page: searchParams.page ? +searchParams.page : 1,
    })
  }

  return (
    <>
      <div className='flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center'>
        <h1 className='h1-bold text-dark100_light900'>All Questions</h1>

        <Link href='/ask-question' className='flex justify-end max-sm:w-full'>
          <Button className='primary-gradient min-h-[46px] px-4 py-3 !text-light-900'>
            Ask a Question
          </Button>
        </Link>
      </div>

      <div className='mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center'>
        <LocalSearchbar
          route='/'
          iconPosition='left'
          placeholder='Search questions...'
          otherClasses='flex-1'
        />

        <Filter
          filters={homePageFilters}
          otherClasses='min-h-[56px] sm:min-w-[170px]'
          containerClasses='hidden max-md:flex'
        />
      </div>

      <HomeFilters />

      <div className='mt-10 flex w-full flex-col gap-6'>
        {result.questions.length > 0 ? (
          result.questions.map(
            ({
              _id,
              title,
              tags,
              author,
              upvotes,
              answers,
              views,
              createdAt,
            }) => (
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
              />
            )
          )
        ) : (
          <NoResult
            title='There’s no question to show'
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
