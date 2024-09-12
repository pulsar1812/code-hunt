import Image from 'next/image'

type MetricProps = {
  imgUrl: string
  alt: string
  value: string | number
  title: string
}

export default function Metric({ imgUrl, alt, value, title }: MetricProps) {
  return (
    <div>
      <div className='flex-center flex-wrap gap-1'>
        <Image
          src={imgUrl}
          alt={alt}
          width={16}
          height={16}
          className='object-contain'
        />
        <p className='text-dark400_light800 small-regular flex items-center gap-1'>
          {value}
          <span className='small-regular line-clamp-1'>{title}</span>
        </p>
      </div>
    </div>
  )
}
