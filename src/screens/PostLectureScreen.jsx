import { useState } from 'react'
import StatBar from '../components/StatBar.jsx'
import StarRating from '../components/StarRating.jsx'
import EventOverlay from '../components/EventOverlay.jsx'

function getLectureFeedback(lecturePlan, result, popularity) {
  const hints = []
  if (lecturePlan.pace === 'fast' && result.participationDelta < 5) {
    hints.push('Students struggled to keep up with the fast pace.')
  }
  if (lecturePlan.groupWork > 30 && popularity < 40) {
    hints.push('Group work backfired — students need to trust you more first.')
  }
  if (lecturePlan.theoryVsPractice > 70 && result.learningDelta < 3) {
    hints.push('Heavy theory without slides or textbooks left students confused.')
  }
  if (result.finalEngagementRatio > 0.7) {
    hints.push('Great engagement — most students were paying attention at the end.')
  }
  return hints
}

function getPopularityNote(engagementRatio, popularityDelta) {
  if (engagementRatio >= 0.7) return `${Math.round(engagementRatio * 100)}% of students were engaged at end of class — popularity went up.`
  if (engagementRatio >= 0.4) return `${Math.round(engagementRatio * 100)}% engagement — not enough to move your popularity.`
  return `Only ${Math.round(engagementRatio * 100)}% of students were engaged at the end — popularity dropped.`
}

export default function PostLectureScreen({ gameState, onNext }) {
  const {
    lastLectureResult: result,
    participation, learning, popularity,
    currentDay, totalDays, lecturePlan,
  } = gameState

  const pendingPostEvents = result?.pendingPostEvents || []

  const [postEventIdx, setPostEventIdx] = useState(0)
  const [postChoiceEffects, setPostChoiceEffects] = useState([])
  const [postChoiceRecords, setPostChoiceRecords] = useState([])
  const [phase, setPhase] = useState(pendingPostEvents.length > 0 ? 'events' : 'summary')

  if (!result) return null

  // Accumulate extra effects from post-event choices
  const postExtra = postChoiceEffects.reduce((acc, fx) => ({
    participation: (acc.participation || 0) + (fx.participation || 0),
    learning: (acc.learning || 0) + (fx.learning || 0),
    popularity: (acc.popularity || 0) + (fx.popularity || 0),
  }), {})

  const totalPDelta = result.participationDelta + (postExtra.participation || 0)
  const totalLDelta = result.learningDelta + (postExtra.learning || 0)
  const totalPopDelta = result.popularityDelta + (postExtra.popularity || 0)

  const newParticipation = Math.min(100, Math.max(0, participation + totalPDelta))
  const newLearning = Math.min(100, Math.max(0, learning + totalLDelta))
  const newPopularity = Math.min(100, Math.max(0, popularity + totalPopDelta))

  function handlePostEventChoice(event, choice) {
    const fx = choice.effects || {}
    setPostChoiceEffects(prev => [...prev, fx])
    setPostChoiceRecords(prev => [...prev, {
      eventId: event.id,
      eventTitle: event.title,
      choiceIndex: event.choices.indexOf(choice),
      choiceLabel: choice.label,
    }])
    if (postEventIdx + 1 >= pendingPostEvents.length) {
      setPhase('summary')
    } else {
      setPostEventIdx(i => i + 1)
    }
  }

  function handleNext() {
    onNext({
      participation: postExtra.participation || 0,
      learning: postExtra.learning || 0,
      popularity: postExtra.popularity || 0,
      choiceRecords: postChoiceRecords,
    })
  }

  const hints = getLectureFeedback(lecturePlan, result, popularity)
  const isLastDay = currentDay >= totalDays
  const won = newParticipation >= 100 && newLearning >= 100

  return (
    <div className="screen screen-postlecture">
      {phase === 'events' && (
        <EventOverlay
          event={pendingPostEvents[postEventIdx]}
          onChoose={handlePostEventChoice}
        />
      )}

      {phase === 'summary' && (
        <div className="screen-content">
          <div className="postlecture-header">
            <h2>End of Day {currentDay}</h2>
            <p className="screen-subtitle">Here's how today's lecture went.</p>
          </div>

          <div className="results-grid">
            <div className="result-card">
              <div className="result-label">Participation</div>
              <div className="result-value">
                <span className="result-old">{Math.round(participation)}%</span>
                <span className="result-arrow">→</span>
                <span className="result-new">{Math.round(newParticipation)}%</span>
                <span className={`result-delta ${totalPDelta >= 0 ? 'delta-pos' : 'delta-neg'}`}>
                  {totalPDelta >= 0 ? '+' : ''}{Math.round(totalPDelta)}
                </span>
              </div>
              <StatBar label="" value={newParticipation} color="#38a169" />
            </div>

            <div className="result-card">
              <div className="result-label">Learning</div>
              <div className="result-value">
                <span className="result-old">{Math.round(learning)}%</span>
                <span className="result-arrow">→</span>
                <span className="result-new">{Math.round(newLearning)}%</span>
                <span className={`result-delta ${totalLDelta >= 0 ? 'delta-pos' : 'delta-neg'}`}>
                  {totalLDelta >= 0 ? '+' : ''}{Math.round(totalLDelta)}
                </span>
              </div>
              <StatBar label="" value={newLearning} color="#3182ce" />
            </div>

            <div className="result-card result-card-popularity">
              <div className="result-label">Popularity</div>
              <div className="result-value">
                <span className={`result-delta ${totalPopDelta >= 0 ? 'delta-pos' : 'delta-neg'}`}>
                  {totalPopDelta >= 0 ? '+' : ''}{Math.round(totalPopDelta)}
                </span>
              </div>
              <StarRating value={newPopularity} />
              <div className="popularity-note">{getPopularityNote(result.finalEngagementRatio, totalPopDelta)}</div>
            </div>

            <div className="result-card">
              <div className="result-label">Class Engagement</div>
              <div className="engagement-bar">
                <div
                  className="engagement-fill"
                  style={{ width: `${Math.round(result.finalEngagementRatio * 100)}%` }}
                />
              </div>
              <div className="engagement-pct">{Math.round(result.finalEngagementRatio * 100)}% engaged at end of class</div>
            </div>
          </div>

          {result.eventsTriggered.length > 0 && (
            <div className="events-summary">
              <h3>Events During Class</h3>
              {result.eventsTriggered.map((evt, i) => (
                <div key={i} className="event-summary-item">
                  <strong>{evt.title}</strong> — {evt.description}
                </div>
              ))}
            </div>
          )}

          {postChoiceEffects.length > 0 && (
            <div className="events-summary">
              <h3>After Class</h3>
              {pendingPostEvents.map((evt, i) => (
                <div key={i} className="event-summary-item">
                  <strong>{evt.title}</strong> — {evt.description}
                </div>
              ))}
            </div>
          )}

          {hints.length > 0 && (
            <div className="feedback-box">
              <h3>Lecture Feedback</h3>
              <ul>
                {hints.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          )}

          <div className="popularity-guide-small">
            <strong>How to improve popularity:</strong> Keep students engaged through the end of class — having 70%+ green seats gives a boost. Slow or medium pace, friendly event choices, and giving breaks all help. Harsh choices or low engagement hurt it.
          </div>

          {won && (
            <div className="win-banner">
              Both stats hit 100%! Your students are thriving. See your final score below.
            </div>
          )}

          <button className="btn btn-primary btn-large" onClick={handleNext}>
            {won || isLastDay ? 'See Final Score' : `Start Day ${currentDay + 1}`}
          </button>
        </div>
      )}
    </div>
  )
}
