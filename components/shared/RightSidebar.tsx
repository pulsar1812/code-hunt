import Image from 'next/image'
import Link from 'next/link'

import RenderTag from './RenderTag'
import { getHotQuestions } from '@/lib/actions/question.action'
import { getTopPopularTags } from '@/lib/actions/tag.action'

export default async function RightSidebar() {
  const hotQuestions = await getHotQuestions()
  const popularTags = await getTopPopularTags()

  return (
    <section
      className='custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 
        flex h-screen flex-col overflow-y-auto border-l p-6 pt-36 max-xl:hidden lg:w-[350px]'
    >
      <div>
        <h3 className='h3-bold text-dark200_light900'>Top Questions</h3>
        <div className='mt-6 flex flex-col gap-6'>
          {hotQuestions.map((question) => (
            <Link
              key={question._id}
              href={`/question/${question._id}`}
              className='flex justify-between gap-7'
            >
              <p className='body-medium text-dark500_light700'>
                {question.title}
              </p>
              <Image
                src='/assets/icons/chevron-right.svg'
                alt='Chevron Right Icon'
                width={20}
                height={20}
                className='invert-colors'
              />
            </Link>
          ))}
        </div>
      </div>

      <div className='mt-16'>
        <h3 className='h3-bold text-dark200_light900'>Popular Tags</h3>
        <div className='mt-6 flex flex-col gap-6'>
          {popularTags.map((tag) => (
            <RenderTag
              key={tag._id}
              _id={tag._id}
              name={tag.name}
              frequency={tag.numberOfQuestions}
              showCount
            />
          ))}
        </div>
      </div>
    </section>
  )
}
