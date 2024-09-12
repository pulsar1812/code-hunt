'use server'

import User from '@/models/User'
import Tag, { ITag } from '@/models/Tag'
import Question from '@/models/Question'
import { connectToDB } from '../mongoose'
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from './shared.types'
import console from 'console'
import { FilterQuery } from 'mongoose'

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  const { userId } = params

  try {
    await connectToDB()

    const user = await User.findById(userId)

    if (!user) throw new Error('User not found')

    return [
      { _id: '1', name: 'css' },
      { _id: '2', name: 'python' },
      { _id: '3', name: 'react' },
    ]
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getAllTags(params: GetAllTagsParams) {
  try {
    await connectToDB()

    const { page = 1, pageSize = 3, searchQuery, filter } = params

    const query: FilterQuery<typeof Tag> = {}

    if (searchQuery) {
      // @ts-ignore
      query.$or = [{ name: { $regex: new RegExp(searchQuery, 'i') } }]
    }

    let sortOptions = {}

    switch (filter) {
      case 'popular':
        sortOptions = { questions: -1 }
        break
      case 'recent':
        sortOptions = { createdOn: -1 }
        break
      case 'name':
        sortOptions = { name: 1 }
        break
      case 'old':
        sortOptions = { createdOn: 1 }
        break
      default:
        break
    }

    const tags = await Tag.find(query)
      .sort(sortOptions)
      .skip(pageSize * (page - 1))
      .limit(pageSize)

    const totalTags = await Tag.countDocuments(query)

    const isNext = totalTags > pageSize * (page - 1) + tags.length

    return { tags, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  const { tagId, page = 1, pageSize = 3, searchQuery } = params

  try {
    await connectToDB()

    const tagFilter: FilterQuery<ITag> = { _id: tagId }

    const tag = await Tag.findOne(tagFilter).populate({
      path: 'questions',
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: 'i' } }
        : {},
      options: {
        sort: { createdAt: -1 },
        skip: pageSize * (page - 1),
        limit: pageSize + 1,
      },
      populate: [
        { path: 'tags', model: Tag, select: '_id name' },
        { path: 'author', model: User, select: '_id clerkId name picture' },
      ],
    })

    if (!tag) {
      throw new Error('Tag not found')
    }

    const tagQuestions = tag.questions

    const isNext = tagQuestions.length > pageSize

    return { questions: tagQuestions, tagTitle: tag.name, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getTopPopularTags() {
  try {
    await connectToDB()

    const popularTags = await Tag.aggregate([
      { $project: { name: 1, numberOfQuestions: { $size: '$questions' } } },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 },
    ])

    return popularTags
  } catch (error) {
    console.log(error)
    throw error
  }
}
