'use server'
import { revalidatePath } from 'next/cache'

import Answer from '@/models/Answer'
import Question from '@/models/Question'
import { connectToDB } from '../mongoose'
import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from './shared.types'
import Interaction from '@/models/Interaction'
import User from '@/models/User'

export async function createAnswer(params: CreateAnswerParams) {
  const { author, content, question, path } = params

  try {
    await connectToDB()

    const answer = await Answer.create({
      author,
      content,
      question,
    })

    const questionObject = await Question.findByIdAndUpdate(question, {
      $push: { answers: answer._id },
    })

    await Interaction.create({
      user: author,
      action: 'answer',
      question,
      answer: answer._id,
      tags: questionObject.tags,
    })

    await User.findByIdAndUpdate(author, { $inc: { reputation: 10 } })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getAnswers(params: GetAnswersParams) {
  const { questionId, sortBy } = params

  try {
    await connectToDB()

    let sortOptions = {}

    switch (sortBy) {
      case 'highest_upvotes':
        sortOptions = { upvotes: -1 }
        break
      case 'lowest_upvotes':
        sortOptions = { upvotes: 1 }
        break
      case 'recent':
        sortOptions = { createdAt: -1 }
        break
      case 'old':
        sortOptions = { createdAt: 1 }
        break
      default:
        break
    }

    const answers = await Answer.find({ question: questionId })
      .populate('author', '_id clerkId name picture')
      .sort(sortOptions)

    return { answers }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function deleteAnswer(params: DeleteAnswerParams) {
  const { answerId, path } = params

  try {
    await connectToDB()

    const answer = await Answer.findById(answerId)

    if (!answer) {
      throw new Error('Answer not found')
    }

    await answer.deleteOne({ _id: answerId })
    await Question.updateMany(
      { _id: answer.question },
      { $pull: { answer: answerId } }
    )
    await Interaction.deleteMany({ answer: answerId })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function upvoteAnswer(params: AnswerVoteParams) {
  const { answerId, userId, hasUpvoted, hasDownvoted, path } = params

  try {
    await connectToDB()

    let updateQuery = {}

    if (hasUpvoted) {
      updateQuery = { $pull: { upvotes: userId } }
    } else if (hasDownvoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      }
    } else {
      updateQuery = { $addToSet: { upvotes: userId } }
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    })

    if (!answer) {
      throw new Error('Answer not found')
    }

    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasUpvoted ? -2 : 2 },
    })

    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasUpvoted ? -10 : 10 },
    })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function downvoteAnswer(params: AnswerVoteParams) {
  const { answerId, userId, hasUpvoted, hasDownvoted, path } = params

  try {
    await connectToDB()

    let updateQuery = {}

    if (hasDownvoted) {
      updateQuery = { $pull: { downvotes: userId } }
    } else if (hasUpvoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      }
    } else {
      updateQuery = { $addToSet: { downvotes: userId } }
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    })

    if (!answer) {
      throw new Error('Answer not found')
    }

    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasDownvoted ? 2 : -2 },
    })

    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasDownvoted ? 10 : -10 },
    })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}
