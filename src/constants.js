export const STARTING_STATS = {
  participation: 15,
  learning: 10,
  popularity: 50,
  money: 0,
}

export const DAILY_SALARY = 500

export const MS_PER_GAME_MINUTE = 2000 // at 1x speed

export const TOTAL_GAME_MINUTES = 50 // 9:00 AM to 9:50 AM

export const MAX_EVENTS_PER_LECTURE = 2
export const EVENT_CHANCE_PER_MINUTE = 0.04

export const SEAT_COUNT = 30
export const SEATS_PER_ROW = 6

export const ITEMS = [
  {
    id: 'whiteboard_markers',
    name: 'Whiteboard Markers',
    price: 20,
    description: 'Colorful markers for the whiteboard.',
    effect: '+3 Learning per lecture',
    consumable: false,
    category: 'supplies',
  },
  {
    id: 'printed_handouts',
    name: 'Printed Handouts',
    price: 30,
    description: 'Printed lecture notes for students.',
    effect: '+3 Participation per lecture',
    consumable: true,
    category: 'supplies',
  },
  {
    id: 'laser_pointer',
    name: 'Laser Pointer',
    price: 50,
    description: 'Point at slides and diagrams precisely.',
    effect: '+2 Participation per lecture',
    consumable: false,
    category: 'supplies',
  },
  {
    id: 'online_resources',
    name: 'Online Resources',
    price: 80,
    description: 'Curated online materials and videos.',
    effect: '+5 Learning per lecture',
    consumable: false,
    category: 'supplies',
  },
  {
    id: 'visual_aids',
    name: 'Visual Aids / Slides',
    price: 100,
    description: 'Presentation slides with diagrams and charts.',
    effect: '+5 Learning when lecture is theory-heavy',
    consumable: false,
    category: 'supplies',
  },
  {
    id: 'basic_microphone',
    name: 'Basic Microphone',
    price: 150,
    description: 'A clip-on mic for clearer projection.',
    effect: '+3 Participation; back-row students stay engaged',
    consumable: false,
    category: 'audio',
    upgradesTo: 'premium_microphone',
  },
  {
    id: 'coffee_station',
    name: 'Coffee Station',
    price: 200,
    description: 'A small coffee maker in the back of the room.',
    effect: '+5 Participation per lecture',
    consumable: false,
    category: 'environment',
  },
  {
    id: 'course_textbooks',
    name: 'Course Textbooks',
    price: 250,
    description: 'Physical textbooks for every student.',
    effect: '+8 Learning per lecture',
    consumable: false,
    category: 'supplies',
  },
  {
    id: 'speaker_system',
    name: 'Speaker System',
    price: 300,
    description: 'Amplifies your microphone throughout the room.',
    effect: 'Amplifies mic bonus to +6 Participation (requires mic)',
    consumable: false,
    category: 'audio',
    requires: 'basic_microphone',
  },
  {
    id: 'comfortable_seating',
    name: 'Comfortable Seating',
    price: 350,
    description: 'Padded chairs replace the hard plastic seats.',
    effect: '+7 Participation per lecture',
    consumable: false,
    category: 'environment',
  },
  {
    id: 'premium_microphone',
    name: 'Premium Microphone',
    price: 400,
    description: 'Professional-grade condenser mic.',
    effect: '+8 Participation; upgrades basic mic',
    consumable: false,
    category: 'audio',
    upgrades: 'basic_microphone',
  },
  {
    id: 'interactive_whiteboard',
    name: 'Interactive Whiteboard',
    price: 500,
    description: 'A touch-enabled smart board for interactive lessons.',
    effect: '+8 Learning +8 Participation per lecture',
    consumable: false,
    category: 'technology',
  },
]

export const LECTURE_PLAN_DEFAULTS = {
  theoryVsPractice: 50,
  pace: 'medium',
  qaTime: 10,
  groupWork: 0,
}

export const SCORE_THRESHOLDS = {
  S: 0.4,
  A: 0.2,
  B: 0.0,
}
