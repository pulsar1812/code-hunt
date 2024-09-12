import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  const { questionContent } = await request.json()

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent(questionContent)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ text })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}
