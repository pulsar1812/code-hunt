import Image from 'next/image'
import Link from 'next/link'
import { SignedIn, UserButton } from '@clerk/nextjs'

import Theme from './Theme'
import MobileNav from './MobileNav'
import GlobalSearch from '../search/GlobalSearch'

export default function Navbar() {
  return (
    <nav
      className='flex-between background-light900_dark200 fixed z-50 w-full 
    gap-5 p-6 shadow-light-300 dark:shadow-none sm:px-12'
    >
      <Link href='/' className='flex items-center gap-1'>
        <Image
          src='/assets/images/site-logo.svg'
          alt='Code Hunt'
          width={23}
          height={23}
        />
        {/* max-sm means @media not all and (min-width: 640px) */}
        <p className='h2-bold font-spaceGrotesk text-primary-500 dark:text-light-900 max-sm:hidden'>
          Code Hunt
        </p>
      </Link>

      <GlobalSearch />

      <div className='flex-between gap-5'>
        <Theme />
        <SignedIn>
          <UserButton
            afterSignOutUrl='/'
            appearance={{
              elements: {
                avatarBox: 'h-10 w-10',
              },
              variables: {
                colorPrimary: '#FF7000',
              },
            }}
          />
        </SignedIn>
        <MobileNav />
      </div>
    </nav>
  )
}
