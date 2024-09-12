import type { Metadata } from 'next'

import TagCard from '@/components/card/TagCard'
import Filter from '@/components/shared/Filter'
import NoResult from '@/components/shared/NoResult'
import Pagination from '@/components/shared/Pagination'
import LocalSearchbar from '@/components/shared/search/LocalSearchbar'
import { tagFilters } from '@/constants/filters'
import { getAllTags } from '@/lib/actions/tag.action'
import { SearchParamsProps } from '@/types'

export const metadata: Metadata = {
  title: 'Tags | Code Hunt',
  description: 'Tags page of Code Hunt',
  icons: {
    icon: '/assets/images/site-logo.svg',
  },
}

export default async function TagsPage({ searchParams }: SearchParamsProps) {
  const result = await getAllTags({
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: searchParams.page ? +searchParams.page : 1,
  })

  return (
    <>
      <div>
        <h1 className='h1-bold text-dark100_light900'>Tags</h1>
        <div className='mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center'>
          <LocalSearchbar
            route='/tags'
            iconPosition='left'
            placeholder='Search by tag name...'
            otherClasses='flex-1'
          />

          <Filter
            filters={tagFilters}
            otherClasses='min-h-[56px] sm:min-w-[170px]'
          />
        </div>
      </div>

      <section className='mt-10 flex w-full flex-wrap gap-4'>
        {result.tags.length > 0 ? (
          result.tags.map((tag) => <TagCard key={tag._id} tag={tag} />)
        ) : (
          <NoResult
            title='No tags found'
            description='There are no tags found. Ask a Question and kickstart the
            discussion.'
            link='/ask-question'
            linkTitle='Ask a Question'
          />
        )}
      </section>

      <div className='mt-10 '>
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNext}
        />
      </div>
    </>
  )
}
