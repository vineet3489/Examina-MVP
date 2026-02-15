import { openai } from '@/lib/openai'
import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are Examina AI Tutor, a friendly and expert tutor for SSC CGL exam preparation. You help students with:
- English Grammar (Nouns, Pronouns, Tenses, Voice, Narration, etc.)
- Quantitative Aptitude (Arithmetic, Algebra, Geometry, Trigonometry)
- General Intelligence & Reasoning (Coding-Decoding, Analogy, Syllogism, Series)
- General Awareness (History, Geography, Polity, Economics, Science)

Rules:
1. Be encouraging and patient - students may be nervous about exams
2. If the student asks in Hindi/Hinglish, respond in the same language
3. Keep answers concise but thorough - explain with examples
4. When solving math problems, show step-by-step solutions
5. For English grammar, provide rules + examples + common SSC question patterns
6. Reference SSC CGL exam patterns when relevant
7. If unsure, say so honestly rather than giving wrong information
8. Use simple language - avoid jargon
9. End responses with a related practice tip or quick quiz question when appropriate`

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10), // Keep last 10 messages for context
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const reply = completion.choices[0].message.content

    return NextResponse.json({ message: reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to get response' },
      { status: 500 }
    )
  }
}
