'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '../ui/button'

import { homePageFilters } from '@/constants/filters'
import { formUrlQuery } from '@/lib/utils'

export default function HomeFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('')

  const handleTypeClick = (item: string) => {
    if (activeFilter === item) {
      setActiveFilter('')

      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'filter',
        value: null,
      })

      router.push(newUrl, { scroll: false })
    } else {
      setActiveFilter(item)

      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'filter',
        value: item.toLowerCase(),
      })

      router.push(newUrl, { scroll: false })
    }
  }

  return (
    <div className='mt-10 hidden flex-wrap gap-4 md:flex'>
      {homePageFilters.map((filter) => (
        <Button
          key={filter.name}
          onClick={() => handleTypeClick(filter.value)}
          className={`body-medium rounded-lg px-6 py-3 capitalize shadow-none 
          ${
            activeFilter === filter.value
              ? 'bg-secondary-100 text-secondary-500 dark:bg-dark-400 dark:text-secondary-500'
              : 'bg-light-800 text-light-500 dark:bg-dark-300 dark:text-light-500'
          }`}
        >
          {filter.name}
        </Button>
      ))}
    </div>
  )
}
