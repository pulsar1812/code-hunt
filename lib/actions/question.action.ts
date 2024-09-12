'use server'

import { revalidatePath } from 'next/cache'

import Question from '@/models/Question'
import Tag from '@/models/Tag'
import User from '@/models/User'
import { connectToDB } from '../mongoose'
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
  RecommendedParams,
} from './shared.types'
import Answer from '@/models/Answer'
import Interaction from '@/models/Interaction'
import { FilterQuery } from 'mongoose'

export async function getQuestions(params: GetQuestionsParams) {
  try {
    await connectToDB()

    const { page = 1, pageSize = 3, searchQuery, filter } = params

    const query: FilterQuery<typeof Question> = {}

    if (searchQuery) {
      query.$or = [
        // @ts-ignore
        { title: { $regex: new RegExp(searchQuery, 'i') } },
        // @ts-ignore
        { content: { $regex: new RegExp(searchQuery, 'i') } },
      ]
    }

    let sortOptions = {}

    switch (filter) {
      case 'newest':
        sortOptions = { createdAt: -1 }
        break
      case 'frequent':
        sortOptions = { views: -1 }
        break
      case 'unanswered':
        // @ts-ignore
        query.answers = { $size: 0 }
        break
      default:
        break
    }

    const questions = await Question.find(query)
      .populate({ path: 'tags', model: Tag })
      .populate({ path: 'author', model: User })
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .sort(sortOptions)

    const totalQuestions = await Question.countDocuments(query)

    const isNext = totalQuestions > pageSize * (page - 1) + questions.length

    return { questions, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getQuestionById(params: GetQuestionByIdParams) {
  const { questionId } = params

  try {
    await connectToDB()

    const question = await Question.findById(questionId)
      .populate({ path: 'tags', model: Tag, select: '_id name' })
      .populate({
        path: 'author',
        model: User,
        select: '_id clerkId name picture',
      })

    return question
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function createQuestion(params: CreateQuestionParams) {
  const { title, content, tags, author, path } = params

  try {
    await connectToDB()

    const question = await Question.create({
      title,
      content,
      author,
    })

    const tagDocuments = []

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, 'i') } },
        { $setOnInsert: { name: tag }, $push: { questions: question._id } },
        { upsert: true, new: true }
      )

      tagDocuments.push(existingTag._id)
    }

    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    })

    await Interaction.create({
      user: author,
      action: 'ask_question',
      question: question._id,
      tags: tagDocuments,
    })

    await User.findByIdAndUpdate(author, { $inc: { reputation: 5 } })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function editQuestion(params: EditQuestionParams) {
  const { questionId, title, content, path } = params

  try {
    await connectToDB()

    const question = await Question.findById(questionId).populate('tags')

    if (!question) {
      throw new Error('Question not found')
    }

    question.title = title
    question.content = content

    await question.save()

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function deleteQuestion(params: DeleteQuestionParams) {
  const { questionId, path } = params

  try {
    await connectToDB()

    await Question.deleteOne({ _id: questionId })
    await Answer.deleteMany({ question: questionId })
    await Interaction.deleteMany({ question: questionId })
    await Tag.updateMany(
      { questions: questionId },
      { $pull: { questions: questionId } }
    )

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function upvoteQuestion(params: QuestionVoteParams) {
  const { questionId, userId, hasUpvoted, hasDownvoted, path } = params

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

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    })

    if (!question) {
      throw new Error('Question not found')
    }

    // Increment user reputation by +1/-1 for upvoting/revoking an upvote to the question
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasUpvoted ? -1 : 1 },
    })

    // Increment question author reputation by +10/-10 for receiving an upvote/an upvoted question being revoked
    await User.findByIdAndUpdate(question.author, {
      $inc: { reputation: hasUpvoted ? -10 : 10 },
    })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function downvoteQuestion(params: QuestionVoteParams) {
  const { questionId, userId, hasUpvoted, hasDownvoted, path } = params

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

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    })

    if (!question) {
      throw new Error('Question not found')
    }

    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasDownvoted ? 2 : -2 },
    })

    await User.findByIdAndUpdate(question.author, {
      $inc: { reputation: hasDownvoted ? 10 : -10 },
    })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getHotQuestions() {
  try {
    await connectToDB()

    const hotQuestions = await Question.find({})
      .sort({ views: -1, upvotes: -1 })
      .limit(5)

    return hotQuestions
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getRecommendedQuestions(params: RecommendedParams) {
  try {
    await connectToDB()

    const { userId, page = 1, pageSize = 20, searchQuery } = params

    // find user
    const user = await User.findOne({ clerkId: userId })

    if (!user) {
      throw new Error('user not found')
    }

    const skipAmount = (page - 1) * pageSize

    // Find the user's interactions
    const userInteractions = await Interaction.find({ user: user._id })
      .populate('tags')
      .exec()

    // Extract tags from user's interactions
    const userTags = userInteractions.reduce((tags, interaction) => {
      if (interaction.tags) {
        tags = tags.concat(interaction.tags)
      }
      return tags
    }, [])

    // Get distinct tag IDs from user's interactions
    const distinctUserTagIds = [
      // @ts-ignore
      ...new Set(userTags.map((tag: any) => tag._id)),
    ]

    const query: FilterQuery<typeof Question> = {
      $and: [
        // @ts-ignore
        { tags: { $in: distinctUserTagIds } }, // Questions with user's tags
        // @ts-ignore
        { author: { $ne: user._id } }, // Exclude user's own questions
      ],
    }

    if (searchQuery) {
      query.$or = [
        // @ts-ignore
        { title: { $regex: searchQuery, $options: 'i' } },
        // @ts-ignore
        { content: { $regex: searchQuery, $options: 'i' } },
      ]
    }

    const totalQuestions = await Question.countDocuments(query)

    const recommendedQuestions = await Question.find(query)
      .populate({
        path: 'tags',
        model: Tag,
      })
      .populate({
        path: 'author',
        model: User,
      })
      .skip(skipAmount)
      .limit(pageSize)

    const isNext = totalQuestions > skipAmount + recommendedQuestions.length

    return { questions: recommendedQuestions, isNext }
  } catch (error) {
    console.error('Error getting recommended questions:', error)
    throw error
  }
}
