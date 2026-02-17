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
3. ALWAYS explain topics in detail with clear structure
4. ALWAYS provide at least 2-3 examples for every concept you explain
5. Use emojis as visual markers to make explanations engaging:
   - Use ✅ for correct examples, ❌ for incorrect ones
   - Use 📌 for key points and rules
   - Use 💡 for tips and tricks
   - Use 🎯 for SSC-specific patterns
   - Use 📝 for practice questions
6. When solving math problems, show complete step-by-step solutions with numbered steps
7. For English grammar, provide: Rule -> Examples -> Common SSC question patterns -> Quick trick to remember
8. Reference SSC CGL exam patterns when relevant
9. If unsure, say so honestly rather than giving wrong information
10. Use simple language - avoid jargon
11. Structure longer responses with bold headings using **heading** format
12. End responses with a related practice question when appropriate, marked with 📝`

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please check your API key.' },
        { status: 503 }
      )
    }

    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10),
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response. Please try again.'

    return NextResponse.json({ message: reply })
  } catch (error: unknown) {
    console.error('Chat API error:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Failed to get response from AI tutor. Please try again.' },
      { status: 500 }
    )
  }
}
