'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { profileSchema } from '@/lib/validations'
import { updateUser } from '@/lib/actions/user.action'

type Props = {
  clerkId: string
  user: string
}

export default function ProfileForm({ clerkId, user }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const parsedUser = JSON.parse(user)

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: parsedUser.name || '',
      username: parsedUser.username || '',
      portfolioWebsite: parsedUser.portfolioWebsite || '',
      location: parsedUser.location || '',
      bio: parsedUser.bio || '',
    },
  })

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsSubmitting(true)

    try {
      await updateUser({
        clerkId,
        updateData: {
          name: values.name,
          username: values.username,
          portfolioWebsite: values.portfolioWebsite,
          location: values.location,
          bio: values.bio,
        },
        path: pathname,
      })

      router.back()
    } catch (error) {
      console.log(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='mt-9 flex w-full flex-col gap-9'
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='paragraph-semibold text-dark400_light800'>
                Name <span className='text-primary-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='Your Name'
                  className='no-focus paragraph-regular light-border-2 background-light800_dark300 
                  text-dark300_light700 min-h-[56px] border'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='paragraph-semibold text-dark400_light800'>
                Username <span className='text-primary-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='Your Username'
                  className='no-focus paragraph-regular light-border-2 background-light800_dark300 
                  text-dark300_light700 min-h-[56px] border'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='portfolioWebsite'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='paragraph-semibold text-dark400_light800'>
                Portfolio Link
              </FormLabel>
              <FormControl>
                <Input
                  type='url'
                  placeholder='Your Portfolio Link'
                  className='no-focus paragraph-regular light-border-2 background-light800_dark300 
                  text-dark300_light700 min-h-[56px] border'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='location'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='paragraph-semibold text-dark400_light800'>
                Location <span className='text-primary-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='Where do you live?'
                  className='no-focus paragraph-regular light-border-2 background-light800_dark300 
                  text-dark300_light700 min-h-[56px] border'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='paragraph-semibold text-dark400_light800'>
                Bio <span className='text-primary-500'>*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What's special about you?"
                  className='no-focus paragraph-regular light-border-2 background-light800_dark300 
                  text-dark300_light700 min-h-[56px] border'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='mt-7 flex justify-end'>
          <Button
            type='submit'
            className='primary-gradient w-fit !text-light-900'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
