import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

const EVALUATION_PROMPTS = {
  guest_speaker: {
    criteria: "Evaluate whether the professor's instructions to the guest speaker are clear, pedagogically sound, and well-matched to student learning goals. Consider specificity, relevance, and student benefit.",
    scoreMap: {
      excellent: { participationDelta: 12, learningDelta: 8,  popularityDelta: 6,   hiddenImpactDelta: 5  },
      good:      { participationDelta: 8,  learningDelta: 5,  popularityDelta: 4,   hiddenImpactDelta: 0  },
      poor:      { participationDelta: 3,  learningDelta: -2, popularityDelta: 2,   hiddenImpactDelta: 0  },
    },
  },
  exam_week: {
    criteria: "Evaluate whether the professor balances student support with academic rigor during exam week. Does the response show genuine empathy while still providing real educational value? Consider how well it addresses student stress without abandoning learning goals.",
    scoreMap: {
      excellent: { participationDelta: 10, learningDelta: 6,  popularityDelta: 8,   hiddenImpactDelta: 0  },
      good:      { participationDelta: 6,  learningDelta: 3,  popularityDelta: 4,   hiddenImpactDelta: 0  },
      poor:      { participationDelta: -4, learningDelta: 2,  popularityDelta: -6,  hiddenImpactDelta: 0  },
    },
  },
  student_sleeping: {
    criteria: "Evaluate how the professor handles this sensitive classroom situation. Does the approach balance maintaining class focus, showing compassion for the student, and avoiding public humiliation? The best responses are tactful and constructive.",
    scoreMap: {
      excellent: { participationDelta: 8,  learningDelta: 2,  popularityDelta: 10,  hiddenImpactDelta: 0  },
      good:      { participationDelta: 4,  learningDelta: 1,  popularityDelta: 3,   hiddenImpactDelta: 0  },
      poor:      { participationDelta: -5, learningDelta: 0,  popularityDelta: -8,  hiddenImpactDelta: 0  },
    },
  },
  bad_review: {
    criteria: "Evaluate the professor's approach to addressing the negative online review. Does the response demonstrate integrity, self-awareness, and constructive leadership? Consider whether it acknowledges feedback without being defensive, dismissive, or unprofessional.",
    scoreMap: {
      excellent: { participationDelta: 8,  learningDelta: 3,  popularityDelta: 10,  hiddenImpactDelta: 5  },
      good:      { participationDelta: 5,  learningDelta: 2,  popularityDelta: 4,   hiddenImpactDelta: 0  },
      poor:      { participationDelta: -3, learningDelta: 0,  popularityDelta: -12, hiddenImpactDelta: -10 },
    },
  },
  student_confrontation: {
    criteria: "Evaluate whether the professor responds to the public challenge with composure, professionalism, and genuine openness. Does the response maintain classroom respect without being dismissive or retaliatory? The best responses de-escalate tension while modeling intellectual humility.",
    scoreMap: {
      excellent: { participationDelta: 5,  learningDelta: 4,  popularityDelta: 12,  hiddenImpactDelta: 5  },
      good:      { participationDelta: 3,  learningDelta: 2,  popularityDelta: 5,   hiddenImpactDelta: 0  },
      poor:      { participationDelta: -8, learningDelta: -2, popularityDelta: -12, hiddenImpactDelta: -8  },
    },
  },
  viral_question: {
    criteria: "Evaluate the follow-up content the professor plans to post. Consider whether it builds on the student's question thoughtfully, adds educational value, and would resonate with a broader audience.",
    scoreMap: {
      excellent: { participationDelta: 5,  learningDelta: 6,  popularityDelta: 18,  hiddenImpactDelta: 0  },
      good:      { participationDelta: 3,  learningDelta: 4,  popularityDelta: 10,  hiddenImpactDelta: 0  },
      poor:      { participationDelta: 0,  learningDelta: 1,  popularityDelta: 4,   hiddenImpactDelta: 0  },
    },
  },
  surprise_evaluation: {
    criteria: "Evaluate the professor's described approach to adapting their lecture with the department chair watching. Consider composure, pedagogical quality, student-centeredness, and authenticity. Does this reflect good teaching instincts under pressure?",
    scoreMap: {
      excellent: { participationDelta: 6,  learningDelta: 8,  popularityDelta: 10,  hiddenImpactDelta: 5  },
      good:      { participationDelta: 3,  learningDelta: 4,  popularityDelta: 4,   hiddenImpactDelta: 0  },
      poor:      { participationDelta: -2, learningDelta: 0,  popularityDelta: -10, hiddenImpactDelta: -5  },
    },
  },
}

export async function evaluateTextResponse(eventId, eventDescription, playerResponse) {
  const prompt = EVALUATION_PROMPTS[eventId]
  if (!prompt) {
    return { participationDelta: 0, learningDelta: 0, popularityDelta: 0, hiddenImpactDelta: 0, quality: 'good', reasoning: '', feedback: 'Response recorded.' }
  }

  const systemPrompt = `You are evaluating a professor's decision in an educational simulation game.
${prompt.criteria}

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{"quality": "excellent|good|poor", "reasoning": "One or two sentences explaining specifically why you gave this rating.", "feedback": "One sentence describing the in-class outcome for the players."}`

  const userMessage = `Event: ${eventDescription}

Professor's response: "${playerResponse}"`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 250,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const raw = message.content[0].text.trim()
    // Strip markdown code fences in case the model adds them
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned)
    const quality = ['excellent', 'good', 'poor'].includes(parsed.quality) ? parsed.quality : 'good'
    const deltas = prompt.scoreMap[quality]

    return {
      ...deltas,
      quality,
      reasoning: parsed.reasoning || '',
      feedback: parsed.feedback || 'Response recorded.',
    }
  } catch {
    return {
      participationDelta: 3,
      learningDelta: 3,
      popularityDelta: 2,
      hiddenImpactDelta: 0,
      quality: 'good',
      reasoning: '',
      feedback: 'The class responded positively.',
    }
  }
}
