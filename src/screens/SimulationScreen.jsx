import { useEffect, useRef, useState } from 'react'
import {
  computeTickDeltas,
  getItemBonuses,
  initializeSeatEngagement,
  updateSeats,
  seatEngagementToState,
  computeFinalEngagementRatio,
  computePopularityDelta,
  applyEndOfDayItemBonuses,
  clampStat,
} from '../gameLogic.js'
import { shouldTriggerEvent, selectEvent } from '../eventSystem.js'
import { MS_PER_GAME_MINUTE } from '../constants.js'
import ClassroomGrid from '../components/ClassroomGrid.jsx'
import SpeedControls from '../components/SpeedControls.jsx'
import MidLecturePanel from '../components/MidLecturePanel.jsx'
import EventOverlay from '../components/EventOverlay.jsx'
import StatBar from '../components/StatBar.jsx'
import StarRating from '../components/StarRating.jsx'

function formatTime(minutes) {
  const totalMins = 9 * 60 + minutes
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayH = h > 12 ? h - 12 : h
  return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`
}

const TOTAL_GAME_MINUTES_CONST = 50

export default function SimulationScreen({ gameState, onEnd }) {
  const { lecturePlan, participation, learning, popularity, inventory, dayHistory } = gameState

  // Refs — never trigger re-renders
  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)
  const accumRef = useRef(0)
  const seatEngagementRef = useRef(null)
  const minutesRef = useRef(0)
  const runningParticipationRef = useRef(participation)
  const runningLearningRef = useRef(learning)
  const eventsTriggeredRef = useRef([])
  const choiceEffectsRef = useRef([])   // accumulates effects from player choices during lecture
  const audioDisabledRef = useRef(false)
  const midAdjustmentRef = useRef(null)
  const endCalledRef = useRef(false)

  // State — triggers re-renders
  const [speed, setSpeed] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [seatStates, setSeatStates] = useState(() =>
    seatEngagementToState(initializeSeatEngagement(popularity))
  )
  const [minutesElapsed, setMinutesElapsed] = useState(0)
  const [activeEvent, setActiveEvent] = useState(null)
  const [actionLastUsed, setActionLastUsed] = useState({})
  const [runningStats, setRunningStats] = useState({ participation, learning })

  // Initialize seat engagement ref once
  if (seatEngagementRef.current === null) {
    seatEngagementRef.current = initializeSeatEngagement(popularity)
  }

  const speedRef = useRef(speed)
  const isPausedRef = useRef(isPaused)
  const activeEventRef = useRef(activeEvent)

  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
  useEffect(() => { activeEventRef.current = activeEvent }, [activeEvent])

  function advanceOneGameMinute() {
    const t = minutesRef.current
    if (t >= TOTAL_GAME_MINUTES_CONST) return

    const itemBonuses = getItemBonuses(inventory, audioDisabledRef.current)
    const deltas = computeTickDeltas(
      lecturePlan,
      runningParticipationRef.current,
      runningLearningRef.current,
      popularity,
      t,
      itemBonuses,
    )

    runningParticipationRef.current = clampStat(runningParticipationRef.current + deltas.participationDelta)
    runningLearningRef.current = clampStat(runningLearningRef.current + deltas.learningDelta)

    // Update seat engagement
    const currentAdj = midAdjustmentRef.current
    midAdjustmentRef.current = null
    seatEngagementRef.current = updateSeats(
      seatEngagementRef.current,
      deltas.participationDelta,
      currentAdj,
      itemBonuses,
    )

    // Speed Up gives a small immediate learning boost
    if (currentAdj === 'speedUp') {
      runningLearningRef.current = clampStat(runningLearningRef.current + 2)
    }

    minutesRef.current = t + 1

    // Snapshot to state
    setSeatStates(seatEngagementToState(seatEngagementRef.current))
    setMinutesElapsed(minutesRef.current)
    setRunningStats({
      participation: runningParticipationRef.current,
      learning: runningLearningRef.current,
    })

    // Update action cooldowns
    setActionLastUsed(prev => {
      const updated = {}
      for (const [key, val] of Object.entries(prev)) {
        if (val < 50) updated[key] = val + 1
      }
      return updated
    })

    // Check for random event
    if (shouldTriggerEvent(t, eventsTriggeredRef.current)) {
      const event = selectEvent(eventsTriggeredRef.current.map(e => e.id), dayHistory, 'during')
      if (event) {
        eventsTriggeredRef.current = [...eventsTriggeredRef.current, event]
        setActiveEvent(event)
      }
    }

    // End of lecture
    if (minutesRef.current >= TOTAL_GAME_MINUTES_CONST) {
      endLecture()
    }
  }

  function endLecture() {
    if (endCalledRef.current) return
    endCalledRef.current = true

    cancelAnimationFrame(rafRef.current)

    const itemBonuses = applyEndOfDayItemBonuses(inventory, lecturePlan)
    const finalParticipation = clampStat(runningParticipationRef.current + itemBonuses.pDelta)
    const finalLearning = clampStat(runningLearningRef.current + itemBonuses.lDelta)

    const engagementRatio = computeFinalEngagementRatio(seatEngagementRef.current)
    const popularityFromEngagement = computePopularityDelta(engagementRatio)

    // Sum up all in-lecture choice effects
    let choiceP = 0, choiceL = 0, choicePop = 0
    for (const fx of choiceEffectsRef.current) {
      choiceP += fx.participation || 0
      choiceL += fx.learning || 0
      choicePop += fx.popularity || 0
    }

    // Select a post-lecture event (effects resolved interactively in PostLectureScreen)
    const pendingPostEvents = []
    if (Math.random() < 0.35) {
      const postEvent = selectEvent(eventsTriggeredRef.current.map(e => e.id), dayHistory, 'post')
      if (postEvent) pendingPostEvents.push(postEvent)
    }

    onEnd({
      participationDelta: clampStat(finalParticipation + choiceP) - participation,
      learningDelta: clampStat(finalLearning + choiceL) - learning,
      popularityDelta: popularityFromEngagement + choicePop,
      finalEngagementRatio: engagementRatio,
      eventsTriggered: eventsTriggeredRef.current,
      pendingPostEvents,
    })
  }

  useEffect(() => {
    function tick(timestamp) {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp
      const delta = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      if (!isPausedRef.current && !activeEventRef.current) {
        accumRef.current += delta * speedRef.current

        while (accumRef.current >= MS_PER_GAME_MINUTE) {
          accumRef.current -= MS_PER_GAME_MINUTE
          if (minutesRef.current < TOTAL_GAME_MINUTES_CONST) {
            advanceOneGameMinute()
          }
        }
      }

      if (minutesRef.current < TOTAL_GAME_MINUTES_CONST) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  function handleSpeedChange(s) {
    setSpeed(s)
  }

  function handlePauseToggle() {
    setIsPaused(p => !p)
    lastTimeRef.current = null
  }

  function handleAction(actionId) {
    midAdjustmentRef.current = actionId
    setActionLastUsed(prev => ({ ...prev, [actionId]: 0 }))
  }

  function handleEventChoice(event, choice) {
    const fx = choice.effects || {}
    if (fx.disableAudio) audioDisabledRef.current = true
    choiceEffectsRef.current.push(fx)
    setActiveEvent(null)
    lastTimeRef.current = null
  }

  const progress = (minutesElapsed / TOTAL_GAME_MINUTES_CONST) * 100

  return (
    <div className="screen screen-simulation">
      <div className="sim-header">
        <div className="sim-time">
          <span className="time-display">{formatTime(minutesElapsed)}</span>
          <div className="time-track">
            <div className="time-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="time-end">9:50 AM</span>
        </div>
        <div className="sim-live-stats">
          <StatBar label="Participation" value={runningStats.participation} color="#38a169" />
          <StatBar label="Learning" value={runningStats.learning} color="#3182ce" />
          <StarRating value={popularity} />
        </div>
        <SpeedControls
          speed={speed}
          onSpeedChange={handleSpeedChange}
          isPaused={isPaused}
          onPauseToggle={handlePauseToggle}
        />
      </div>

      <div className="sim-body">
        <ClassroomGrid seatStates={seatStates} />
        <MidLecturePanel onAction={handleAction} lastUsed={actionLastUsed} />
      </div>

      {activeEvent && (
        <EventOverlay event={activeEvent} onChoose={handleEventChoice} />
      )}
    </div>
  )
}
