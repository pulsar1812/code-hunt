import Link from 'next/link'
import { Badge } from '../ui/badge'

type TagProps = {
  _id: string
  name: string
  frequency?: number
  showCount?: boolean
}

export default function RenderTag({
  _id,
  name,
  frequency,
  showCount,
}: TagProps) {
  return (
    <Link href={`/tags/${_id}`} className='flex justify-between gap-2'>
      <Badge
        className='subtle-medium text-light400_light500 background-light800_dark300 rounded-md 
        border-none px-4 py-2 uppercase'
      >
        {name}
      </Badge>

      {showCount && (
        <p className='small-medium text-dark500_light700'>{frequency}</p>
      )}
    </Link>
  )
}
