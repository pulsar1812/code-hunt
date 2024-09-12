'use server'

import { revalidatePath } from 'next/cache'
import { FilterQuery } from 'mongoose'

import { connectToDB } from '../mongoose'
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  UpdateUserParams,
  ToggleSaveQuestionParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
} from './shared.types'
import Question from '@/models/Question'
import User from '@/models/User'
import Answer from '@/models/Answer'
import Tag from '@/models/Tag'
import { BadgeCriteriaType } from '@/types'
import { assignBadges } from '../utils'

export async function getUserById(params: any) {
  const { userId } = params

  try {
    await connectToDB()

    const user = await User.findOne({ clerkId: userId })

    return user
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    await connectToDB()

    const { page = 1, pageSize = 3, searchQuery, filter } = params

    const query: FilterQuery<typeof User> = {}

    if (searchQuery) {
      query.$or = [
        // @ts-ignore
        { name: { $regex: new RegExp(searchQuery, 'i') } },
        // @ts-ignore
        { username: { $regex: new RegExp(searchQuery, 'i') } },
      ]
    }

    let sortOptions = {}

    switch (filter) {
      case 'new_users':
        sortOptions = { joinedAt: -1 }
        break
      case 'old_users':
        sortOptions = { joinedAt: 1 }
        break
      case 'top_contributors':
        sortOptions = { reputation: -1 }
        break
      default:
        break
    }

    const users = await User.find(query)
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .sort(sortOptions)

    const totalUsers = await User.countDocuments(query)

    const isNext = totalUsers > pageSize * (page - 1) + users.length

    return { users, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    await connectToDB()

    const user = await User.create(userData)

    return user
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function updateUser(params: UpdateUserParams) {
  const { clerkId, updateData, path } = params

  try {
    await connectToDB()

    await User.findOneAndUpdate({ clerkId }, updateData, { new: true })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function deleteUser(params: DeleteUserParams) {
  const { clerkId } = params

  try {
    await connectToDB()

    const user = await User.findOne({ clerkId })

    if (!user) {
      throw new Error('User not found')
    }

    // Delete user from database
    // and delete related questions, answers, comments

    // get user question ids
    // const userQuestionIds = await Question.find({ author: user._id}).distinct('_id');

    // delete user questions
    await Question.deleteMany({ author: user._id })

    // TODO: delete user answers, comments, etc.

    const deletedUser = await User.findByIdAndDelete(user._id)

    return deletedUser
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  const { questionId, userId, path } = params

  try {
    await connectToDB()

    const user = await User.findById(userId)

    if (!user) {
      throw new Error('User not found')
    }

    const isQuestionSaved = user.saved.includes(questionId)

    let updateQuery = {}

    if (isQuestionSaved) {
      updateQuery = { $pull: { saved: questionId } }
    } else {
      updateQuery = { $addToSet: { saved: questionId } }
    }

    await User.findByIdAndUpdate(userId, updateQuery, { new: true })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  const { clerkId, page = 1, pageSize = 3, searchQuery, filter } = params

  try {
    await connectToDB()

    const query: FilterQuery<typeof Question> = searchQuery
      ? // @ts-ignore
        { title: { $regex: new RegExp(searchQuery, 'i') } }
      : {}

    let sortOptions = {}

    switch (filter) {
      case 'most_recent':
        sortOptions = { createdAt: -1 }
        break
      case 'oldest':
        sortOptions = { createdAt: 1 }
        break
      case 'most_voted':
        sortOptions = { upvotes: -1 }
        break
      case 'most_viewed':
        sortOptions = { views: -1 }
        break
      case 'most_answered':
        sortOptions = { answers: -1 }
        break
      default:
        break
    }

    const user = await User.findOne({ clerkId }).populate({
      path: 'saved',
      match: query,
      options: {
        sort: sortOptions,
        skip: pageSize * (page - 1),
        limit: pageSize + 1,
      },
      populate: [
        { path: 'tags', select: '_id name' },
        { path: 'author', select: '_id clerkId name picture' },
      ],
    })

    if (!user) {
      throw new Error('User not found')
    }

    const savedQuestions = user.saved

    const isNext = savedQuestions.length > pageSize

    return { questions: savedQuestions, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  const { userId } = params

  try {
    await connectToDB()

    const user = await User.findOne({ clerkId: userId })

    if (!user) {
      throw new Error('User not found')
    }

    const totalQuestions = await Question.countDocuments({ author: user._id })
    const totalAnswers = await Answer.countDocuments({ author: user._id })

    const [questionUpvotes] = await Question.aggregate([
      { $match: { author: user._id } },
      {
        $project: {
          _id: 0,
          upvotes: { $size: '$upvotes' },
        },
      },
      {
        $group: {
          _id: null,
          totalUpvotes: { $sum: '$upvotes' },
        },
      },
    ])

    const [answerUpvotes] = await Answer.aggregate([
      { $match: { author: user._id } },
      {
        $project: {
          _id: 0,
          upvotes: { $size: '$upvotes' },
        },
      },
      {
        $group: {
          _id: null,
          totalUpvotes: { $sum: '$upvotes' },
        },
      },
    ])

    const [questionViews] = await Question.aggregate([
      { $match: { author: user._id } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
        },
      },
    ])

    const criteria = [
      { type: 'QUESTION_COUNT' as BadgeCriteriaType, count: totalQuestions },
      { type: 'ANSWER_COUNT' as BadgeCriteriaType, count: totalAnswers },
      {
        type: 'QUESTION_UPVOTES' as BadgeCriteriaType,
        count: questionUpvotes?.totalUpvotes || 0,
      },
      {
        type: 'ANSWER_UPVOTES' as BadgeCriteriaType,
        count: answerUpvotes?.totalUpvotes || 0,
      },
      {
        type: 'TOTAL_VIEWS' as BadgeCriteriaType,
        count: questionViews?.totalViews || 0,
      },
    ]

    const badgeCounts = assignBadges({ criteria })

    return {
      user,
      totalQuestions,
      totalAnswers,
      badgeCounts,
      reputation: user.reputation,
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  const { userId, page = 1, pageSize = 3 } = params

  try {
    await connectToDB()

    const totalQuestions = await Question.countDocuments({ author: userId })

    const userQuestions = await Question.find({ author: userId })
      .sort({ createdAt: -1, views: -1, upvotes: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .populate({ path: 'tags', model: Tag, select: '_id name' })
      .populate({
        path: 'author',
        model: User,
        select: '_id clerkId name picture',
      })

    const isNext = totalQuestions > pageSize * (page - 1) + userQuestions.length

    return { totalQuestions, questions: userQuestions, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  const { userId, page = 1, pageSize = 3 } = params

  try {
    await connectToDB()

    const totalAnswers = await Answer.countDocuments({ author: userId })

    const userAnswers = await Answer.find({ author: userId })
      .sort({ upvotes: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .populate({
        path: 'question',
        model: Question,
        select: '_id title',
      })
      .populate({
        path: 'author',
        model: User,
        select: '_id clerkId name picture',
      })

    const isNext = totalAnswers > pageSize * (page - 1) + userAnswers.length

    return { totalAnswers, answers: userAnswers, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}
