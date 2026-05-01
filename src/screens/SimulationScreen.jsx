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
import { shouldTriggerEvent, getEventByDiceTotal, isEventAvailable } from '../eventSystem.js'
import { MS_PER_GAME_MINUTE } from '../constants.js'
import ClassroomGrid from '../components/ClassroomGrid.jsx'
import SpeedControls from '../components/SpeedControls.jsx'
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
const POST_EVENT_DELAY_MS = 2000
const EVENT_COOLDOWN_MINUTES = 15

export default function SimulationScreen({ gameState, onEnd }) {
  const { lecturePlan, participation, learning, popularity, inventory, dayHistory, currentDay, totalDays } = gameState

  // Refs — never trigger re-renders
  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)
  const accumRef = useRef(0)
  const seatEngagementRef = useRef(null)
  const minutesRef = useRef(0)
  const runningParticipationRef = useRef(participation)
  const runningLearningRef = useRef(learning)
  const eventsTriggeredRef = useRef([])
  const choiceEffectsRef = useRef([])
  const choiceRecordsRef = useRef([])
  const hiddenImpactsRef = useRef([])
  const audioDisabledRef = useRef(false)
  const endCalledRef = useRef(false)
  const waitingForDiceRef = useRef(false)
  const resumeAtRef = useRef(0)       // wall-clock ms; simulation blocked until past this
  const lastEventMinuteRef = useRef(-EVENT_COOLDOWN_MINUTES) // allows first event from minute 5

  // State — triggers re-renders
  const [speed, setSpeed] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [diceRerollMsg, setDiceRerollMsg] = useState(null)
  const [seatStates, setSeatStates] = useState(() =>
    seatEngagementToState(initializeSeatEngagement(popularity))
  )
  const [minutesElapsed, setMinutesElapsed] = useState(0)
  const [activeEvent, setActiveEvent] = useState(null)
  const [runningStats, setRunningStats] = useState({ participation, learning })
  const [diceGate, setDiceGate] = useState(null)

  if (seatEngagementRef.current === null) {
    seatEngagementRef.current = initializeSeatEngagement(popularity)
  }

  const speedRef = useRef(speed)
  const isPausedRef = useRef(isPaused)
  const activeEventRef = useRef(activeEvent)
  const waitingForDiceStateRef = useRef(false)

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

    seatEngagementRef.current = updateSeats(
      seatEngagementRef.current,
      deltas.participationDelta,
      null,
      itemBonuses,
    )

    minutesRef.current = t + 1

    setSeatStates(seatEngagementToState(seatEngagementRef.current))
    setMinutesElapsed(minutesRef.current)
    setRunningStats({
      participation: runningParticipationRef.current,
      learning: runningLearningRef.current,
    })

    // Check for random event — enforce 15-minute cooldown between events
    const minutesSinceLast = t - lastEventMinuteRef.current
    if (shouldTriggerEvent(t, eventsTriggeredRef.current) && minutesSinceLast >= EVENT_COOLDOWN_MINUTES) {
      lastEventMinuteRef.current = t
      waitingForDiceRef.current = true
      waitingForDiceStateRef.current = true
      setDiceGate({ minuteTriggered: t })
    }

    if (minutesRef.current >= TOTAL_GAME_MINUTES_CONST) {
      endLecture()
    }
  }

  function handleDiceSubmit(diceTotal) {
    const allTriggeredIds = dayHistory.flatMap(d => d.eventsTriggered.map(e => e.id))
    const alreadyThisLecture = eventsTriggeredRef.current.map(e => e.id)

    const event = getEventByDiceTotal(diceTotal)
    if (event && isEventAvailable(event, alreadyThisLecture, allTriggeredIds)) {
      eventsTriggeredRef.current = [...eventsTriggeredRef.current, { ...event, rolledDiceTotal: diceTotal }]
      setDiceRerollMsg(null)
      setDiceGate(null)
      setActiveEvent({ ...event, rolledDiceTotal: diceTotal })
    } else {
      // Event unavailable — keep dice gate open with re-roll prompt
      setDiceRerollMsg('That event already occurred this semester — have players roll again!')
    }
  }

  function handleEventResolved(hiddenImpact) {
    if (hiddenImpact) {
      hiddenImpactsRef.current.push(hiddenImpact)
    }
    setActiveEvent(null)
    waitingForDiceRef.current = false
    waitingForDiceStateRef.current = false
    resumeAtRef.current = Date.now() + POST_EVENT_DELAY_MS
  }

  function handleEventChoice(event, choice) {
    const fx = choice.effects || {}
    if (fx.disableAudio) audioDisabledRef.current = true
    choiceEffectsRef.current.push(fx)
    choiceRecordsRef.current.push({
      eventId: event.id,
      eventTitle: event.title,
      choiceIndex: event.choices.indexOf(choice),
      choiceLabel: choice.label,
      responseType: 'choice',
    })
    handleEventResolved(choice.hiddenImpact ? {
      eventId: event.id,
      eventTitle: event.title,
      choiceLabel: choice.label,
      ...choice.hiddenImpact,
    } : null)
  }

  function handleTextEventResolved(event, deltas, quality, responseText) {
    const fx = {
      participation: deltas.participationDelta || 0,
      learning: deltas.learningDelta || 0,
      popularity: deltas.popularityDelta || 0,
    }
    choiceEffectsRef.current.push(fx)
    choiceRecordsRef.current.push({
      eventId: event.id,
      eventTitle: event.title,
      choiceIndex: -1,
      responseType: 'text',
      responseText,
      claudeQuality: quality,
      claudeReasoning: deltas.reasoning || '',
      claudeFeedback: deltas.feedback,
      claudeEffects: {
        participationDelta: deltas.participationDelta || 0,
        learningDelta: deltas.learningDelta || 0,
        popularityDelta: deltas.popularityDelta || 0,
      },
    })

    let hiddenImpact = null
    if (deltas.hiddenImpactDelta && deltas.hiddenImpactDelta !== 0) {
      hiddenImpact = {
        eventId: event.id,
        eventTitle: event.title,
        choiceLabel: 'Your response',
        description: deltas.hiddenImpactDelta > 0
          ? 'Your response left a lasting positive impression that quietly built your reputation.'
          : 'Your response left some students uncertain about your approach, quietly affecting your standing.',
        popularityDelta: deltas.hiddenImpactDelta,
      }
    }
    handleEventResolved(hiddenImpact)
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

    let choiceP = 0, choiceL = 0, choicePop = 0
    for (const fx of choiceEffectsRef.current) {
      choiceP += fx.participation || 0
      choiceL += fx.learning || 0
      choicePop += fx.popularity || 0
    }

    onEnd({
      participationDelta: clampStat(finalParticipation + choiceP) - participation,
      learningDelta: clampStat(finalLearning + choiceL) - learning,
      popularityDelta: popularityFromEngagement + choicePop,
      finalEngagementRatio: engagementRatio,
      eventsTriggered: eventsTriggeredRef.current,
      choiceRecords: choiceRecordsRef.current,
      hiddenImpacts: hiddenImpactsRef.current,
    })
  }

  useEffect(() => {
    function tick(timestamp) {
      const isBlocked =
        isPausedRef.current ||
        !!activeEventRef.current ||
        waitingForDiceStateRef.current ||
        Date.now() < resumeAtRef.current

      if (!isBlocked) {
        if (lastTimeRef.current === null) lastTimeRef.current = timestamp
        const delta = timestamp - lastTimeRef.current
        lastTimeRef.current = timestamp

        accumRef.current += delta * speedRef.current

        while (accumRef.current >= MS_PER_GAME_MINUTE) {
          accumRef.current -= MS_PER_GAME_MINUTE
          if (minutesRef.current < TOTAL_GAME_MINUTES_CONST && !waitingForDiceRef.current) {
            advanceOneGameMinute()
          }
        }
      } else {
        // Reset so we don't accumulate a time jump when unblocking
        lastTimeRef.current = null
      }

      if (minutesRef.current < TOTAL_GAME_MINUTES_CONST) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const progress = (minutesElapsed / TOTAL_GAME_MINUTES_CONST) * 100

  return (
    <div className="screen screen-simulation">
      <div className="sim-header">
        <div className="sim-day-badge">Day {currentDay}<span className="sim-day-total">/{totalDays}</span></div>
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
          onSpeedChange={s => setSpeed(s)}
          isPaused={isPaused}
          onPauseToggle={() => {
            setIsPaused(p => !p)
          }}
        />
      </div>

      <div className="sim-body">
        <ClassroomGrid seatStates={seatStates} />
      </div>

      {diceGate && !activeEvent && (
        <DiceGate onSubmit={handleDiceSubmit} rerollMsg={diceRerollMsg} />
      )}

      {activeEvent && (
        <EventOverlay
          event={activeEvent}
          onChoose={handleEventChoice}
          onTextResolved={handleTextEventResolved}
        />
      )}
    </div>
  )
}

function DiceGate({ onSubmit, rerollMsg }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit() {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 2 || num > 12) {
      setError('Please enter a number between 2 and 12.')
      return
    }
    setError('')
    setValue('')
    onSubmit(num)
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="event-overlay">
      <div className="event-card dice-gate-card">
        <div className="dice-gate-icon">🎲🎲</div>
        <div className="event-title">Something happened in class!</div>
        <p className="dice-gate-player-instruction">
          Roll both dice and add the numbers together.
        </p>
        <p className="dice-gate-sub">Tell your Game Master the total.</p>
        <div className="dice-gate-divider" />
        {rerollMsg && <p className="dice-gate-reroll">{rerollMsg}</p>}
        <p className="dice-gate-gm-label">GM — enter the dice total:</p>
        <div className="dice-gate-input-row">
          <input
            type="number"
            min="2"
            max="12"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKey}
            className="dice-input"
            placeholder="2–12"
            autoFocus
          />
          <button className="btn btn-primary" onClick={handleSubmit}>
            Confirm
          </button>
        </div>
        {error && <p className="dice-gate-error">{error}</p>}
      </div>
    </div>
  )
}
