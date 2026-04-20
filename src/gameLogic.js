import { SEAT_COUNT, SEATS_PER_ROW, TOTAL_GAME_MINUTES } from './constants.js'

export function clampStat(value) {
  return Math.max(0, Math.min(100, value))
}

export function getItemBonuses(inventory, audioDisabled) {
  const hasMic = !audioDisabled && (inventory.basic_microphone || inventory.premium_microphone)
  const hasSpeaker = !audioDisabled && inventory.speaker_system
  const hasPremiumMic = !audioDisabled && inventory.premium_microphone

  let micParticipationBonus = 0
  if (hasMic) {
    micParticipationBonus = hasSpeaker ? 6 : (hasPremiumMic ? 8 : 3)
    if (hasPremiumMic && hasSpeaker) micParticipationBonus = 10
  }

  return {
    hasMic,
    hasSpeaker,
    hasTextbooks: !!inventory.course_textbooks,
    hasSlides: !!inventory.visual_aids,
    micParticipationBonus,
  }
}

export function computeTickDeltas(lecturePlan, participation, learning, popularity, minutesElapsed, itemBonuses) {
  const { theoryVsPractice, pace, qaTime, groupWork } = lecturePlan
  const t = minutesElapsed

  const theoryRatio = theoryVsPractice / 100
  const practiceRatio = 1 - theoryRatio

  let learningRate = theoryRatio * 0.15
  let participationRate = practiceRatio * 0.12

  // Theory backfires if students can't keep up
  if (theoryRatio > 0.6 && learning < 40) participationRate -= 0.08
  // Practice without textbooks is shallow
  if (practiceRatio > 0.6 && !itemBonuses.hasTextbooks) learningRate -= 0.05
  // Slides amplify theory
  if (itemBonuses.hasSlides && theoryRatio > 0.5) learningRate += 0.05

  // Pace modifier
  const paceMap = { slow: 0.05, medium: 0, fast: -0.08 }
  participationRate += paceMap[pace] || 0
  if (pace === 'slow') learningRate += 0.03

  // Fatigue curve — dip around minute 25
  const fatiguePenalty = Math.sin((t / TOTAL_GAME_MINUTES) * Math.PI) * 0.06
  participationRate -= fatiguePenalty

  // Q&A boost (front-loaded)
  const qaMinutes = qaTime
  if (t < qaMinutes * 1.5 && t % 5 < 1) {
    participationRate += 0.04
    learningRate -= 0.02
  }

  // Group work
  const gwRatio = groupWork / 100
  participationRate += gwRatio * 0.12
  if (popularity < 40) participationRate -= gwRatio * 0.10

  // Mic bonus per-tick (spread over lecture)
  participationRate += itemBonuses.micParticipationBonus * 0.004

  // Popularity modifier
  const popularityBonus = (popularity - 50) * 0.0004
  participationRate += popularityBonus
  learningRate += popularityBonus * 0.5

  return {
    learningDelta: Math.max(-0.3, Math.min(0.3, learningRate)),
    participationDelta: Math.max(-0.3, Math.min(0.3, participationRate)),
  }
}

export function applyEndOfDayItemBonuses(inventory, lecturePlan) {
  let pDelta = 0
  let lDelta = 0

  if (inventory.whiteboard_markers) lDelta += 3
  if (inventory.printed_handouts > 0) pDelta += 3
  if (inventory.laser_pointer) pDelta += 2
  if (inventory.online_resources) lDelta += 5
  if (inventory.visual_aids && lecturePlan.theoryVsPractice > 50) lDelta += 5
  if (inventory.coffee_station) pDelta += 5
  if (inventory.course_textbooks) lDelta += 8
  if (inventory.comfortable_seating) pDelta += 7
  if (inventory.interactive_whiteboard) { lDelta += 8; pDelta += 8 }

  return { pDelta, lDelta }
}

export function computePopularityDelta(finalEngagementRatio) {
  if (finalEngagementRatio >= 0.7) return Math.floor(Math.random() * 4) + 2
  if (finalEngagementRatio >= 0.4) return 0
  return -(Math.floor(Math.random() * 6) + 3)
}

export function initializeSeatEngagement(popularity) {
  return Array.from({ length: SEAT_COUNT }, (_, i) => {
    const baseEngagement = 40 + (popularity - 50) * 0.2
    const row = Math.floor(i / SEATS_PER_ROW)
    const rowPenalty = row * 4
    const noise = (Math.random() - 0.5) * 20
    return clampStat(baseEngagement - rowPenalty + noise)
  })
}

export function updateSeats(seatEngagement, participationDelta, midAdjustment, itemBonuses) {
  return seatEngagement.map((eng, i) => {
    // participationDelta is ~0.06 per tick; *50 gives ~3 pts/min seat movement
    let delta = participationDelta * 50
    const row = Math.floor(i / SEATS_PER_ROW)

    // Back rows benefit less without mic
    if (row >= 4 && !itemBonuses.hasMic) delta *= 0.5

    // Individual noise
    delta += (Math.random() - 0.5) * 4

    // Mid-lecture adjustments
    if (midAdjustment === 'slowDown') delta += 3
    else if (midAdjustment === 'speedUp') delta -= 3
    else if (midAdjustment === 'askClass') delta += 5
    else if (midAdjustment === 'writeBoard') delta += Math.random() > 0.5 ? 4 : 1
    else if (midAdjustment === 'giveBreak') delta = (50 - eng) * 0.3

    return clampStat(eng + delta)
  })
}

export function seatEngagementToState(engagementValues) {
  return engagementValues.map(eng => {
    if (eng >= 60) return 'engaged'
    if (eng >= 35) return 'neutral'
    return 'disengaged'
  })
}

export function computeFinalEngagementRatio(seatEngagement) {
  const greenCount = seatEngagement.filter(e => e >= 60).length
  return greenCount / seatEngagement.length
}

export function checkWinLose(participation, learning, currentDay, totalDays) {
  if (participation >= 100 && learning >= 100) return 'win'
  if (currentDay > totalDays) return 'gameover'
  return null
}

export function computeScore(won, currentDay, totalDays, participation, learning) {
  if (won) {
    const daysLeft = totalDays - currentDay
    const efficiency = daysLeft / totalDays
    if (efficiency > 0.3) return { grade: 'S', message: 'Perfect professor! You reached them all ahead of schedule.' }
    if (efficiency > 0.1) return { grade: 'A', message: 'Excellent! Your students are thriving.' }
    return { grade: 'B', message: 'Well done! You got everyone on board just in time.' }
  }
  const completionRatio = (participation + learning) / 200
  if (completionRatio > 0.75) return { grade: 'C', message: 'So close! The semester slipped away before you finished.' }
  if (completionRatio > 0.5) return { grade: 'D', message: 'A tough semester. Your students needed more support.' }
  return { grade: 'F', message: 'The classroom never came together. Try a different approach.' }
}
