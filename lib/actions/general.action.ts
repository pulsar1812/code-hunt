'use server'

import Question from '@/models/Question'
import Answer from '@/models/Answer'
import User from '@/models/User'
import Tag from '@/models/Tag'
import { connectToDB } from '../mongoose'
import { SearchParams } from './shared.types'

const SearchableTypes = ['question', 'answer', 'user', 'tag']

export async function globalSearch(params: SearchParams) {
  try {
    await connectToDB()

    const { query, type } = params

    const regexQuery = { $regex: query, $options: 'i' }

    let results = []

    const modelsAndTypes = [
      { model: Question, searchField: 'title', type: 'question' },
      { model: Answer, searchField: 'content', type: 'answer' },
      { model: User, searchField: 'name', type: 'user' },
      { model: Tag, searchField: 'name', type: 'tag' },
    ]

    const typeLower = type?.toLowerCase()

    if (!typeLower || !SearchableTypes.includes(typeLower)) {
      // Search across everything
      for (const { model, searchField, type } of modelsAndTypes) {
        const queryResults = await model
          .find({ [searchField]: regexQuery })
          .limit(2)

        results.push(
          ...queryResults.map((item) => ({
            title:
              type === 'answer'
                ? `Answers containing ${query}`
                : item[searchField],
            type,
            id:
              type === 'user'
                ? item.clerkId
                : type === 'answer'
                ? item.question
                : item._id,
          }))
        )
      }
    } else {
      // Search in the specified model type
      const modelInfo = modelsAndTypes.find((item) => item.type === type)

      console.log(modelInfo, type)
      if (!modelInfo) {
        throw new Error('Invalid search type')
      }

      const queryResults = await modelInfo.model
        .find({ [modelInfo.searchField]: regexQuery })
        .limit(8)

      results = queryResults.map((item) => ({
        title:
          type === 'answer'
            ? `Answers containing ${query}`
            : item[modelInfo.searchField],
        type,
        id:
          type === 'user'
            ? item.clerkId
            : type === 'answer'
            ? item.question
            : item._id,
      }))
    }

    return JSON.stringify(results)
  } catch (error) {
    console.log(error)
    throw error
  }
}
