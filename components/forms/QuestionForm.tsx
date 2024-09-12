'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Editor } from '@tinymce/tinymce-react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { questionSchema } from '@/lib/validations'
import { useTheme } from '@/context/ThemeProvider'
import { createQuestion, editQuestion } from '@/lib/actions/question.action'

type Props = {
  mongoUserId: string
  type?: string
  questionDetails?: string
}

export default function QuestionForm({
  mongoUserId,
  type,
  questionDetails,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const editorRef = useRef(null)
  const router = useRouter()
  const pathname = usePathname()
  const { mode } = useTheme()

  const parsedQuestionDetails =
    questionDetails && JSON.parse(questionDetails || '')

  const groupedTags = parsedQuestionDetails?.tags.map((tag: any) => tag.name)

  // Define form
  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: parsedQuestionDetails?.title || '',
      explanation: parsedQuestionDetails?.content || '',
      tags: groupedTags || [],
    },
  })

  // Define submit handler
  const onSubmit = async (values: z.infer<typeof questionSchema>) => {
    setIsSubmitting(true)

    try {
      if (type === 'Edit') {
        await editQuestion({
          questionId: parsedQuestionDetails._id,
          title: values.title,
          content: values.explanation,
          path: pathname,
        })

        router.push(`/question/${parsedQuestionDetails._id}`)
      } else {
        await createQuestion({
          title: values.title,
          content: values.explanation,
          tags: values.tags,
          author: JSON.parse(mongoUserId),
          path: pathname,
        })

        router.push('/')
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: any
  ) => {
    if (e.key === 'Enter' && field.name === 'tags') {
      e.preventDefault()

      const tagInput = e.target as HTMLInputElement
      const tagValue = tagInput.value.trim()

      if (tagValue !== '') {
        if (tagValue.length > 15) {
          return form.setError('tags', {
            type: 'required',
            message: 'Tag must be less than or equal to 15 characters.',
          })
        }

        if (!field.value.includes(tagValue as never)) {
          console.log('Tag Value', field.value)

          form.setValue('tags', [...field.value, tagValue])
          tagInput.value = ''
          form.clearErrors('tags')
        }
      } else {
        form.trigger()
      }
    }
  }

  const handleTagRemove = (tag: string, field: any) => {
    const newTags = field.value.filter((t: string) => t !== tag)

    form.setValue('tags', newTags)
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex w-full flex-col gap-10'
        >
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem className='flex w-full flex-col'>
                <FormLabel className='paragraph-semibold text-dark400_light800'>
                  Question Title <span className='text-primary-500'>*</span>
                </FormLabel>
                <FormControl className='mt-3.5'>
                  <Input
                    {...field}
                    className='no-focus paragraph-regular background-light900_dark300 light-border-2 
                    text-dark300_light700 min-h-[56px] border'
                  />
                </FormControl>
                <FormDescription className='body-regular mt-2.5 text-light-500'>
                  Be specific and imagine you’re asking a question to another
                  person.
                </FormDescription>
                <FormMessage className='text-red-500' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='explanation'
            render={({ field }) => (
              <FormItem className='flex w-full flex-col gap-3'>
                <FormLabel className='paragraph-semibold text-dark400_light800'>
                  Detailed explanation of your problem?{' '}
                  <span className='text-primary-500'>*</span>
                </FormLabel>
                <FormControl className='mt-3.5'>
                  <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                    onInit={(evt, editor) => {
                      // @ts-ignore
                      editorRef.current = editor
                    }}
                    onBlur={field.onBlur}
                    onEditorChange={(content) => field.onChange(content)}
                    initialValue={parsedQuestionDetails?.content || ''}
                    init={{
                      height: 350,
                      menubar: false,
                      plugins: [
                        'advlist',
                        'autolink',
                        'lists',
                        'link',
                        'image',
                        'charmap',
                        'preview',
                        'anchor',
                        'searchreplace',
                        'visualblocks',
                        'codesample',
                        'fullscreen',
                        'insertdatetime',
                        'media',
                        'table',
                      ],
                      toolbar:
                        'undo redo | ' +
                        'codesample | bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist',
                      content_style:
                        'body { font-family:Inter; font-size:16px }',
                      skin: mode === 'dark' ? 'oxide-dark' : 'oxide',
                      content_css: mode === 'dark' ? 'dark' : 'light',
                    }}
                  />
                </FormControl>
                <FormDescription className='body-regular mt-2.5 text-light-500'>
                  Introduce the problem and expand on what you put in the title.
                  Minimum 100 characters.
                </FormDescription>
                <FormMessage className='text-red-500' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='tags'
            render={({ field }) => (
              <FormItem className='flex w-full flex-col'>
                <FormLabel className='paragraph-semibold text-dark400_light800'>
                  Tags <span className='text-primary-500'>*</span>
                </FormLabel>
                <FormControl className='mt-3.5'>
                  <>
                    <Input
                      className='no-focus paragraph-regular background-light900_dark300 light-border-2 
                    text-dark300_light700 min-h-[56px] border'
                      placeholder='Add tags...'
                      onKeyDown={(e) => handleInputKeyDown(e, field)}
                      disabled={type === 'Edit'}
                    />
                    {field.value.length > 0 && (
                      <div className='flex-start mt-2.5 gap-2.5'>
                        {field.value.map((tag: any) => (
                          <Badge
                            key={tag}
                            className='subtle-medium background-light800_dark400 text-light400_light500 
                            flex-center gap-2 rounded-md border-none px-4 py-2 capitalize'
                            onClick={() =>
                              type !== 'Edit'
                                ? handleTagRemove(tag, field)
                                : () => {}
                            }
                          >
                            {tag}
                            {type !== 'Edit' && (
                              <Image
                                src='/assets/icons/close.svg'
                                alt='Close Icon'
                                width={12}
                                height={12}
                                className='cursor-pointer object-contain invert-0 dark:invert'
                              />
                            )}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                </FormControl>
                <FormDescription className='body-regular mt-2.5 text-light-500'>
                  Add up to 3 tags to describe what your question is about. You
                  need to press enter or return to add a tag.
                </FormDescription>
                <FormMessage className='text-red-500' />
              </FormItem>
            )}
          />
          <Button
            type='submit'
            className='primary-gradient w-fit !text-light-900'
            disabled={isSubmitting}
          >
            {isSubmitting
              ? type === 'Edit'
                ? 'Editing...'
                : 'Posting...'
              : type === 'Edit'
              ? 'Edit Question'
              : 'Ask a Question'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
