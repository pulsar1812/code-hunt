import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getUserById } from '@/lib/actions/user.action'
import ProfileForm from '@/components/forms/ProfileForm'
import { ParamsProps } from '@/types'

export default async function EditProfilePage({ params }: ParamsProps) {
  // Get Clerk ID
  const { userId } = auth()

  if (!userId) redirect('/sign-in')

  const mongoUser = await getUserById({ userId })

  return (
    <>
      <h1 className='h1-bold text-dark100_light900'>Edit Profile</h1>

      <div className='mt-9'>
        <ProfileForm clerkId={userId} user={JSON.stringify(mongoUser)} />
      </div>
    </>
  )
}
