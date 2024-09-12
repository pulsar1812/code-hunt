import Link from 'next/link'

type TagCardProps = {
  tag: {
    _id: string
    name: string
    description: string
    questions: Array<object>
  }
}

export default function TagCard({ tag }: TagCardProps) {
  return (
    <Link
      href={`/tags/${tag._id}`}
      className='shadow-light100_darknone w-full sm:w-[260px]'
    >
      <article
        className='background-light900_dark200 light-border flex w-full flex-col 
      items-start gap-[14px] rounded-xl border px-8 py-10'
      >
        <div className='background-light800_dark400 gap-[18px] rounded px-5 py-1.5'>
          <p className='paragraph-semibold text-dark300_light900 capitalize'>
            {tag.name}
          </p>
        </div>
        <p className='small-regular text-dark500_light700 mt-4'>
          {tag.description}
        </p>
        <p className='body-medium text-dark400_light500 mt-3.5'>
          <span className='body-semibold primary-text-gradient mr-2.5'>
            {tag.questions.length}+
          </span>{' '}
          Questions
        </p>
      </article>
    </Link>
  )
}
