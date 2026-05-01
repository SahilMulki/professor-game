// diceTotal: the 2d6 roll (2-12) that maps to this event
// responseType: 'choice' (3 buttons) | 'text' (Claude API evaluates free text)
// choices with hiddenImpact: { description, popularityDelta, learningDelta, participationDelta }
//   are applied at game end (final screen) but not shown mid-game

export const EVENT_POOL = [
  {
    id: 'plagiarism_accusation',
    title: 'Plagiarism Accusation',
    description: 'Another professor publicly accused you of stealing their research. Word got to your class.',
    weight: 2,
    timing: 'post',
    diceTotal: 2,
    responseType: 'choice',
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
        hiddenImpact: {
          description: 'Your formal statement eventually cleared your name, quietly rebuilding respect.',
          popularityDelta: 8,
        },
      },
      {
        label: 'Stay silent',
        description: 'Let the legal process play out. Rumors spread unchecked.',
        effects: { popularity: -25, participation: -10 },
      },
    ],
  },
  {
    id: 'power_outage',
    title: 'Power Outage',
    description: 'The power flickered and your audio equipment cut out. Students are murmuring.',
    weight: 3,
    timing: 'during',
    diceTotal: 3,
    responseType: 'choice',
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
    diceTotal: 4,
    responseType: 'text',
    textPrompt: 'What topic or focus do you ask the guest speaker to address for your class?',
  },
  {
    id: 'broken_ac',
    title: 'Broken AC',
    description: "The classroom's AC is out. It's getting uncomfortably warm and students are restless.",
    weight: 5,
    timing: 'during',
    diceTotal: 5,
    responseType: 'choice',
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
    id: 'holiday_mood',
    title: 'Pre-Holiday Restlessness',
    description: "It's the day before a holiday. Students' minds are clearly somewhere else.",
    weight: 6,
    timing: 'during',
    diceTotal: 6,
    responseType: 'choice',
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
        hiddenImpact: {
          description: 'Students remembered the professor who refused to acknowledge the holiday — your reputation took a quiet hit.',
          popularityDelta: -8,
        },
      },
    ],
  },
  {
    id: 'exam_week',
    title: 'Exam Week Pressure',
    description: 'Students are visibly stressed — midterms in other courses are piling up.',
    weight: 8,
    timing: 'during',
    diceTotal: 7,
    responseType: 'text',
    textPrompt: 'How do you adjust today\'s lecture to support students through exam week?',
  },
  {
    id: 'student_sleeping',
    title: 'Student Nodding Off',
    description: 'A student in the front row is clearly struggling to stay awake during your lecture.',
    weight: 8,
    timing: 'during',
    diceTotal: 8,
    responseType: 'text',
    textPrompt: 'How do you handle the situation with the student who is struggling to stay awake?',
  },
  {
    id: 'bad_review',
    title: 'Bad Online Review',
    description: 'A scathing RateMyProfessor review appeared overnight. Students are whispering.',
    weight: 4,
    timing: 'post',
    diceTotal: 9,
    responseType: 'text',
    textPrompt: 'How do you address this situation with your class today?',
  },
  {
    id: 'student_confrontation',
    title: 'Student Confrontation',
    description: "A student publicly challenges your teaching style in front of the class, claiming your methods aren't effective.",
    weight: 4,
    timing: 'during',
    diceTotal: 10,
    responseType: 'text',
    textPrompt: 'How do you respond to this public challenge in front of the class?',
  },
  {
    id: 'pop_quiz_moment',
    title: 'Pop Quiz Opportunity',
    description: 'You could announce an unplanned quiz right now. Students have no idea it is coming.',
    weight: 6,
    timing: 'during',
    diceTotal: 11,
    responseType: 'choice',
    choices: [
      {
        label: 'Quiz now',
        description: 'Immediate engagement spike — but students may resent the surprise.',
        effects: { participation: 14, learning: 5, popularity: -10 },
        hiddenImpact: {
          description: 'Word spread about the surprise quiz. Some students complained to friends in other sections, chipping away at your reputation.',
          popularityDelta: -5,
        },
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
    id: 'surprise_evaluation',
    title: 'Surprise Evaluation',
    description: 'The department chair walks in unannounced to observe your lecture. Students notice immediately.',
    weight: 2,
    timing: 'during',
    diceTotal: 12,
    responseType: 'text',
    textPrompt: 'How do you adapt your teaching approach with the department chair watching?',
    maxOccurrences: 1,
  },
]

export function getEventByDiceTotal(total) {
  return EVENT_POOL.find(e => e.diceTotal === total) || null
}

export function shouldTriggerEvent(minutesElapsed, eventsTriggeredThisLecture) {
  if (eventsTriggeredThisLecture.length >= 2) return false
  if (minutesElapsed < 5 || minutesElapsed > 45) return false
  return Math.random() < 0.04
}

export function isEventAvailable(event, triggeredIdsThisLecture, allTriggeredIds) {
  if (triggeredIdsThisLecture.includes(event.id)) return false
  if (event.maxOccurrences) {
    const count = allTriggeredIds.filter(id => id === event.id).length
    if (count >= event.maxOccurrences) return false
  }
  return true
}
