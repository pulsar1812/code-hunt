'use client'

import { useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Editor } from '@tinymce/tinymce-react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { answerSchema } from '@/lib/validations'
import { useTheme } from '@/context/ThemeProvider'
import { createAnswer } from '@/lib/actions/answer.action'

type Props = {
  questionContent: string
  questionId: string
  authorId: string
}

export default function AnswerForm({
  questionContent,
  questionId,
  authorId,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmittingAI, setIsSubmittingAI] = useState(false)
  const editorRef = useRef(null)
  const pathname = usePathname()
  const { mode } = useTheme()

  const form = useForm<z.infer<typeof answerSchema>>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answer: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof answerSchema>) => {
    setIsSubmitting(true)

    try {
      await createAnswer({
        content: values.answer,
        author: JSON.parse(authorId),
        question: JSON.parse(questionId),
        path: pathname,
      })

      form.reset()

      if (editorRef.current) {
        const editor = editorRef.current as any

        editor.setContent('')
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateAIAnswer = async () => {
    if (!authorId) return

    setIsSubmittingAI(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/gemini`,
        {
          method: 'POST',
          body: JSON.stringify({ questionContent }),
        }
      )

      const aiAnswer = await response.json()

      // console.log(aiAnswer.text)

      const formattedAnswer = aiAnswer.text.replace(/\n/g, '<br />')

      if (editorRef.current) {
        const editor = editorRef.current as any
        editor.setContent(formattedAnswer)
      }

      // Toast
    } catch (error) {
      console.log(error)
    } finally {
      setIsSubmittingAI(false)
    }
  }

  return (
    <div>
      <div className='flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2'>
        <h4 className='paragraph-semibold text-dark400_light800'>
          Write your answer here
        </h4>

        <Button
          className='primary-gradient light-border-2 w-fit gap-1.5 rounded-md px-4 py-2.5 !text-light-900 shadow-none'
          onClick={generateAIAnswer}
        >
          {isSubmittingAI ? (
            <>Generating...</>
          ) : (
            <>
              <Image
                src='/assets/icons/stars.svg'
                alt='Stars Icon'
                width={12}
                height={12}
                className='object-contain'
              />
              Generate AI Answer
            </>
          )}
        </Button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex w-full flex-col gap-10'
        >
          <FormField
            control={form.control}
            name='answer'
            render={({ field }) => (
              <FormItem className='flex w-full flex-col gap-3'>
                <FormControl className='mt-3.5'>
                  <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                    onInit={(evt, editor) => {
                      // @ts-ignore
                      editorRef.current = editor
                    }}
                    onBlur={field.onBlur}
                    onEditorChange={(content) => field.onChange(content)}
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
                <FormMessage className='text-red-500' />
              </FormItem>
            )}
          />

          <div className='flex justify-end'>
            <Button
              type='submit'
              className='primary-gradient w-fit !text-light-900'
              disabled={isSubmitting}
              onClick={() => {
                toast({
                  title: 'Answer Posted',
                  description: 'Your answer has been successfully posted.',
                })
              }}
            >
              {isSubmitting ? 'Posting...' : 'Post Answer'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
