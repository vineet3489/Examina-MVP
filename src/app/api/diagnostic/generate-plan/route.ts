import { openai } from '@/lib/openai'
import { NextResponse } from 'next/server'
import studyPlanTemplate from '@/data/study-plan.json'

export async function POST(request: Request) {
  try {
    const { scores } = await request.json()
    // scores: { english: { score, total }, maths: { score, total }, reasoning: { score, total }, gk: { score, total } }

    const weakSubjects = Object.entries(scores)
      .filter(([, data]) => {
        const d = data as { score: number; total: number }
        return (d.score / d.total) < 0.6
      })
      .map(([subject]) => subject)

    const strongSubjects = Object.entries(scores)
      .filter(([, data]) => {
        const d = data as { score: number; total: number }
        return (d.score / d.total) >= 0.6
      })
      .map(([subject]) => subject)

    // Adjust the study plan template based on strengths/weaknesses
    const adjustedPlan = {
      ...studyPlanTemplate,
      weak_subjects: weakSubjects,
      strong_subjects: strongSubjects,
      recommendation: weakSubjects.length > 0
        ? `Focus extra time on ${weakSubjects.join(', ')}. Spend 60% of your study time on weak areas and 40% on maintaining strong subjects.`
        : 'Great foundation! Focus on advanced topics and timed practice to build exam-day speed.',
    }

    return NextResponse.json({ plan: adjustedPlan })
  } catch (error) {
    console.error('Plan generation error:', error)
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 })
  }
}
