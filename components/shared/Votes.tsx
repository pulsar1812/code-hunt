'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

import { downvoteQuestion, upvoteQuestion } from '@/lib/actions/question.action'
import { downvoteAnswer, upvoteAnswer } from '@/lib/actions/answer.action'
import { toggleSaveQuestion } from '@/lib/actions/user.action'
import { formatAndDivideNumber } from '@/lib/utils'
import { viewQuestion } from '@/lib/actions/interaction.action'

type Props = {
  type: string
  userId: string
  itemId: string
  upvotes: number
  downvotes: number
  hasUpvoted: boolean
  hasDownvoted: boolean
  hasSaved?: boolean
}

export default function Votes({
  type,
  userId,
  itemId,
  upvotes,
  downvotes,
  hasUpvoted,
  hasDownvoted,
  hasSaved,
}: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSave = async () => {
    await toggleSaveQuestion({
      questionId: JSON.parse(itemId),
      userId: JSON.parse(userId),
      path: pathname,
    })

    return toast({
      title: `Question ${
        !hasSaved ? 'Saved in' : 'Removed from'
      } your collection`,
      variant: !hasSaved ? 'default' : 'destructive',
    })
  }

  const handleVote = async (action: string) => {
    if (!userId) {
      return toast({
        title: 'Please log in',
        description: 'You must be logged in to perform this action',
      })
    }

    if (action === 'upvote') {
      if (type === 'Question') {
        await upvoteQuestion({
          questionId: JSON.parse(itemId),
          userId: JSON.parse(userId),
          hasUpvoted,
          hasDownvoted,
          path: pathname,
        })
      } else if (type === 'Answer') {
        await upvoteAnswer({
          answerId: JSON.parse(itemId),
          userId: JSON.parse(userId),
          hasUpvoted,
          hasDownvoted,
          path: pathname,
        })
      }

      return toast({
        title: `Upvote ${!hasUpvoted ? 'Successful' : 'Removed'}`,
        variant: !hasUpvoted ? 'default' : 'destructive',
      })
    }

    if (action === 'downvote') {
      if (type === 'Question') {
        await downvoteQuestion({
          questionId: JSON.parse(itemId),
          userId: JSON.parse(userId),
          hasUpvoted,
          hasDownvoted,
          path: pathname,
        })
      } else if (type === 'Answer') {
        await downvoteAnswer({
          answerId: JSON.parse(itemId),
          userId: JSON.parse(userId),
          hasUpvoted,
          hasDownvoted,
          path: pathname,
        })
      }

      return toast({
        title: `Downvote ${!hasDownvoted ? 'Successful' : 'Removed'}`,
        variant: !hasDownvoted ? 'default' : 'destructive',
      })
    }
  }

  useEffect(() => {
    viewQuestion({
      questionId: JSON.parse(itemId),
      userId: userId ? JSON.parse(userId) : undefined,
    })
  }, [itemId, userId, pathname, router])

  return (
    <div className='flex gap-4'>
      <div className='flex-center gap-2.5'>
        <div className='flex-center gap-1.5'>
          <Image
            src={
              hasUpvoted
                ? '/assets/icons/upvoted.svg'
                : '/assets/icons/upvote.svg'
            }
            alt='Upvote Icon'
            width={18}
            height={18}
            onClick={() => handleVote('upvote')}
            className='cursor-pointer'
          />
          <div className='flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1'>
            <p className='subtle-medium text-dark400_light900'>
              {formatAndDivideNumber(upvotes)}
            </p>
          </div>
        </div>

        <div className='flex-center gap-1.5'>
          <Image
            src={
              hasDownvoted
                ? '/assets/icons/downvoted.svg'
                : '/assets/icons/downvote.svg'
            }
            alt='Downvote Icon'
            width={18}
            height={18}
            onClick={() => handleVote('downvote')}
            className='cursor-pointer'
          />
          <div className='flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1'>
            <p className='subtle-medium text-dark400_light900'>
              {formatAndDivideNumber(downvotes)}
            </p>
          </div>
        </div>
      </div>

      {type === 'Question' && (
        <Image
          src={
            hasSaved
              ? '/assets/icons/star-filled.svg'
              : '/assets/icons/star-red.svg'
          }
          alt='Star Icon'
          width={18}
          height={18}
          onClick={handleSave}
          className='primary-text-gradient cursor-pointer'
        />
      )}
    </div>
  )
}
