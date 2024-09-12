'use server'

import Interaction from '@/models/Interaction'
import { connectToDB } from '../mongoose'
import { ViewQuestionParams } from './shared.types'
import Question from '@/models/Question'

export async function viewQuestion(params: ViewQuestionParams) {
  const { questionId, userId } = params

  try {
    await connectToDB()

    await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } })

    if (userId) {
      const existingInteraction = await Interaction.findOne({
        user: userId,
        action: 'view',
        question: questionId,
      })

      if (existingInteraction)
        return console.log('User has already viewed this question')

      await Interaction.create({
        user: userId,
        action: 'view',
        question: questionId,
      })
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}
