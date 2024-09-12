'use client'

import Image from 'next/image'

import { useTheme } from '@/context/ThemeProvider'
import Link from 'next/link'
import { Button } from '../ui/button'

type NoResultProps = {
  title: string
  description: string
  link: string
  linkTitle: string
}

export default function NoResult({
  title,
  description,
  link,
  linkTitle,
}: NoResultProps) {
  const { mode } = useTheme()

  return (
    <div className='flex-center mt-10 w-full flex-col'>
      <Image
        src={`/assets/images/${
          mode === 'light' ? 'light-illustration.png' : 'dark-illustration.png'
        }`}
        alt='No Result Illustration'
        width={200}
        height={200}
      />
      <h2 className='text-dark200_light900 h2-bold mt-8 text-center capitalize'>
        {title}
      </h2>
      <p className='text-dark500_light700 body-regular my-3.5 max-w-md text-center'>
        {description}
      </p>
      <Link href={link} className='flex-center'>
        <Button className='primary-gradient min-h-[46px] px-4 py-3 capitalize !text-light-900'>
          {linkTitle}
        </Button>
      </Link>
    </div>
  )
}
