export const EVENT_POOL = [
  {
    id: 'student_sleeping',
    title: 'Student Nodding Off',
    description: 'A student in the front row is clearly struggling to stay awake during your lecture.',
    weight: 8,
    timing: 'during',
    choices: [
      {
        label: 'Call them out',
        description: 'Address the student directly. Everyone else snaps to attention.',
        effects: { participation: 10, popularity: -8 },
      },
      {
        label: 'Take a quick break',
        description: 'Give everyone 5 minutes to reset. Students recharge but you lose lecture time.',
        effects: { participation: 5, learning: -4 },
      },
      {
        label: 'Carry on',
        description: 'Stay focused and ignore the disruption.',
        effects: {},
      },
    ],
  },
  {
    id: 'exam_week',
    title: 'Exam Week Pressure',
    description: 'Students are visibly stressed — midterms in other courses are piling up.',
    weight: 8,
    timing: 'during',
    choices: [
      {
        label: 'Review for exams',
        description: 'Dedicate part of class to exam prep. Students are grateful but cover less new material.',
        effects: { participation: 8, learning: -6, popularity: 5 },
      },
      {
        label: 'Push through material',
        description: 'Stay on your planned content. Students struggle but make real progress.',
        effects: { learning: 6, participation: -8 },
      },
      {
        label: 'Acknowledge and lighten up',
        description: 'Note the stress, then continue with a more relaxed tone.',
        effects: { participation: 3, popularity: 4 },
      },
    ],
  },
  {
    id: 'holiday_mood',
    title: 'Pre-Holiday Restlessness',
    description: "It's the day before a holiday. Students' minds are clearly somewhere else.",
    weight: 6,
    timing: 'during',
    choices: [
      {
        label: 'Lean into the energy',
        description: 'Switch to games and group activities. Fun, but light on content.',
        effects: { participation: 12, learning: -8, popularity: 8 },
      },
      {
        label: 'Cut class short',
        description: 'Keep it brief and let everyone out early. Students appreciate it.',
        effects: { participation: 5, learning: -5, popularity: 5 },
      },
      {
        label: 'Business as usual',
        description: 'Hold the full lecture. Consistent, but students check out.',
        effects: { participation: -10, learning: 3 },
      },
    ],
  },
  {
    id: 'broken_ac',
    title: 'Broken AC',
    description: "The classroom's AC is out. It's getting uncomfortably warm and students are restless.",
    weight: 5,
    timing: 'during',
    choices: [
      {
        label: 'Open the windows',
        description: 'Let some air in. Helps a little, but street noise drifts in too.',
        effects: { participation: -3, learning: -2 },
      },
      {
        label: 'Cut class 10 minutes short',
        description: 'End early. Students appreciate the gesture and respect you for it.',
        effects: { participation: 3, learning: -6, popularity: 5 },
      },
      {
        label: 'Power through',
        description: 'Everyone is uncomfortable, but you stay on schedule.',
        effects: { participation: -8, learning: 2 },
      },
    ],
  },
  {
    id: 'pop_quiz_moment',
    title: 'Pop Quiz Opportunity',
    description: 'You could announce an unplanned quiz right now. Students have no idea it is coming.',
    weight: 6,
    timing: 'during',
    choices: [
      {
        label: 'Quiz now',
        description: 'Immediate engagement spike — but students may resent the surprise.',
        effects: { participation: 14, learning: 5, popularity: -10 },
      },
      {
        label: 'Announce one for tomorrow',
        description: 'Students will come more prepared to the next lecture.',
        effects: { learning: 8, participation: 3, popularity: -2 },
      },
      {
        label: 'Skip it',
        description: 'Keep the positive atmosphere going.',
        effects: {},
      },
    ],
  },
  {
    id: 'power_outage',
    title: 'Power Outage',
    description: 'The power flickered and your audio equipment cut out. Students are murmuring.',
    weight: 3,
    timing: 'during',
    choices: [
      {
        label: 'Project your voice',
        description: 'Teach without the mic. Back-row students struggle but class continues.',
        effects: { participation: -6, disableAudio: true },
      },
      {
        label: 'Rearrange into a circle',
        description: 'Pull desks together for a discussion-style format. More intimate.',
        effects: { participation: 5, learning: -3, disableAudio: true },
      },
      {
        label: 'Take a 5-minute break',
        description: 'Wait and hope the power comes back. Some time is lost.',
        effects: { participation: 2, learning: -5, disableAudio: true },
      },
    ],
  },
  {
    id: 'guest_speaker',
    title: 'Guest Speaker Offer',
    description: 'A colleague stops by and offers to speak to your class for 10 minutes.',
    weight: 3,
    timing: 'during',
    choices: [
      {
        label: 'Let them speak',
        description: 'A fresh voice energizes the room, but you lose lecture time.',
        effects: { participation: 12, learning: -4, popularity: 6 },
      },
      {
        label: 'Bring them in for Q&A',
        description: 'Students get to ask the expert questions directly.',
        effects: { participation: 8, learning: 6, popularity: 4 },
      },
      {
        label: 'Politely decline',
        description: 'Stay on your lesson plan.',
        effects: { learning: 3 },
      },
    ],
  },
  {
    id: 'bad_review',
    title: 'Bad Online Review',
    description: 'A scathing RateMyProfessor review appeared overnight. Students are whispering.',
    weight: 4,
    timing: 'post',
    choices: [
      {
        label: 'Address it openly in class',
        description: 'Be transparent about the feedback. Students respect honesty.',
        effects: { popularity: -5, participation: 6 },
      },
      {
        label: 'Respond constructively',
        description: 'Use the criticism to visibly improve your approach.',
        effects: { popularity: -8, learning: 6 },
      },
      {
        label: 'Ignore it',
        description: "Pretend it didn't happen. The rumor lingers.",
        effects: { popularity: -15 },
      },
    ],
  },
  {
    id: 'viral_question',
    title: 'Viral Student Question',
    description: "A student's brilliant question got shared on social media — your answer is being praised.",
    weight: 4,
    timing: 'post',
    choices: [
      {
        label: 'Post a follow-up online',
        description: 'Build on the momentum with a detailed written response.',
        effects: { popularity: 18, learning: 4 },
      },
      {
        label: 'Bring it back to class',
        description: "Use tomorrow's lecture to explore the question further.",
        effects: { popularity: 10, participation: 8 },
      },
      {
        label: 'Stay humble',
        description: 'Let the moment pass naturally.',
        effects: { popularity: 6 },
      },
    ],
  },
  {
    id: 'plagiarism_accusation',
    title: 'Plagiarism Accusation',
    description: 'Another professor publicly accused you of stealing their research. Word got to your class.',
    weight: 2,
    timing: 'post',
    maxOccurrences: 1,
    choices: [
      {
        label: 'Address it with your class',
        description: 'Be direct and honest with your students. They appreciate it.',
        effects: { popularity: -10, participation: 5 },
      },
      {
        label: 'Issue a formal response',
        description: 'Put out a public statement. Students take sides.',
        effects: { popularity: -15, participation: -5 },
      },
      {
        label: 'Stay silent',
        description: 'Let the legal process play out. Rumors spread unchecked.',
        effects: { popularity: -25, participation: -10 },
      },
    ],
  },
]

export function shouldTriggerEvent(minutesElapsed, eventsTriggeredThisLecture) {
  if (eventsTriggeredThisLecture.length >= 2) return false
  if (minutesElapsed < 5 || minutesElapsed > 45) return false
  return Math.random() < 0.04
}

export function selectEvent(triggeredIdsThisLecture, dayHistory, timing) {
  const allTriggeredIds = dayHistory.flatMap(d => d.eventsTriggered.map(e => e.id))

  const available = EVENT_POOL.filter(e => {
    if (e.timing !== timing) return false
    if (triggeredIdsThisLecture.includes(e.id)) return false
    if (e.maxOccurrences) {
      const count = allTriggeredIds.filter(id => id === e.id).length
      if (count >= e.maxOccurrences) return false
    }
    return true
  })

  if (available.length === 0) return null

  const totalWeight = available.reduce((sum, e) => sum + e.weight, 0)
  let r = Math.random() * totalWeight
  for (const event of available) {
    r -= event.weight
    if (r <= 0) return event
  }
  return available[available.length - 1]
}
