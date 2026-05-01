import { useEffect, useRef, useState } from 'react'
import { computeScore, clampStat } from '../gameLogic.js'
import { EVENT_POOL } from '../eventSystem.js'
import StatBar from '../components/StatBar.jsx'
import StarRating from '../components/StarRating.jsx'

const GRADE_COLORS = {
  S: '#d69e2e',
  A: '#38a169',
  B: '#3182ce',
  C: '#805ad5',
  D: '#dd6b20',
  F: '#e53e3e',
}

const LS_KEY = 'professorGame_eventCounts'

export default function FinalScoreScreen({ gameState, onPlayAgain }) {
  const { participation, learning, popularity, currentDay, totalDays, wonGame, dayHistory, hiddenImpacts = [] } = gameState

  // Apply accumulated hidden impacts to final stats
  const totalHiddenPop = hiddenImpacts.reduce((s, h) => s + (h.popularityDelta || 0), 0)
  const totalHiddenLearn = hiddenImpacts.reduce((s, h) => s + (h.learningDelta || 0), 0)
  const totalHiddenPart = hiddenImpacts.reduce((s, h) => s + (h.participationDelta || 0), 0)

  const adjustedParticipation = clampStat(participation + totalHiddenPart)
  const adjustedLearning = clampStat(learning + totalHiddenLearn)
  const adjustedPopularity = clampStat(popularity + totalHiddenPop)

  const { grade, message } = computeScore(wonGame, currentDay, totalDays, adjustedParticipation, adjustedLearning)
  const gradeColor = GRADE_COLORS[grade]

  const [eventCounts, setEventCounts] = useState({})
  const didUpdate = useRef(false)

  useEffect(() => {
    if (didUpdate.current) return
    didUpdate.current = true

    const stored = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
    const allRecords = dayHistory.flatMap(d => d.choiceRecords || [])
    for (const rec of allRecords) {
      if (rec.choiceIndex < 0) continue // skip text responses
      if (!stored[rec.eventId]) stored[rec.eventId] = {}
      const key = String(rec.choiceIndex)
      stored[rec.eventId][key] = (stored[rec.eventId][key] || 0) + 1
    }
    localStorage.setItem(LS_KEY, JSON.stringify(stored))
    setEventCounts(stored)
  }, [])

  const avgEngagement = dayHistory.length > 0
    ? Math.round(dayHistory.reduce((s, d) => s + d.finalEngagementRatio, 0) / dayHistory.length * 100)
    : 0

  const totalEvents = dayHistory.reduce((s, d) => s + (d.eventsTriggered?.length || 0), 0)

  const allChoiceRecords = dayHistory.flatMap(d => d.choiceRecords || [])

  return (
    <div className="screen screen-finalscore">
      <div className="screen-content">
        <div className="final-header">
          <div className="grade-display" style={{ color: gradeColor, borderColor: gradeColor }}>
            {grade}
          </div>
          <h1>{wonGame ? 'Semester Complete!' : 'Semester Over'}</h1>
          <p className="final-message">{message}</p>
        </div>

        <div className="final-stats">
          <StatBar label="Final Participation" value={adjustedParticipation} color="#38a169" />
          <StatBar label="Final Learning" value={adjustedLearning} color="#3182ce" />
          <div className="popularity-row">
            <span>Final Popularity</span>
            <StarRating value={adjustedPopularity} />
          </div>
        </div>

        <div className="final-summary">
          <div className="summary-item">
            <span className="summary-label">Days Played</span>
            <span className="summary-value">{Math.min(currentDay, totalDays)} / {totalDays}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Avg. Engagement</span>
            <span className="summary-value">{avgEngagement}%</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Events Encountered</span>
            <span className="summary-value">{totalEvents}</span>
          </div>
        </div>

        {/* Hidden impacts reveal */}
        {hiddenImpacts.length === 0 && (
          <div className="hidden-impacts-section hidden-impacts-none">
            <h3 className="hidden-impacts-heading">🔍 Hidden Impacts</h3>
            <p className="hidden-impacts-subhead">No hidden impacts occurred this game — your choices had no lasting hidden consequences.</p>
          </div>
        )}
        {hiddenImpacts.length > 0 && (
          <div className="hidden-impacts-section">
            <h3 className="hidden-impacts-heading">🔍 Revealed: Hidden Impacts</h3>
            <p className="hidden-impacts-subhead">
              Some decisions had consequences that only became clear at the end of the semester.
            </p>
            {hiddenImpacts.map((impact, i) => (
              <div key={i} className="hidden-impact-card">
                <div className="hidden-impact-event">{impact.eventTitle}</div>
                <div className="hidden-impact-choice">Choice: {impact.choiceLabel}</div>
                <p className="hidden-impact-desc">{impact.description}</p>
                <div className="hidden-impact-effects">
                  {impact.popularityDelta !== undefined && impact.popularityDelta !== 0 && (
                    <span className={`effect-tag ${impact.popularityDelta > 0 ? 'effect-good' : 'effect-bad'}`}>
                      {impact.popularityDelta > 0 ? '+' : ''}{impact.popularityDelta} Popularity
                    </span>
                  )}
                  {impact.learningDelta !== undefined && impact.learningDelta !== 0 && (
                    <span className={`effect-tag ${impact.learningDelta > 0 ? 'effect-good' : 'effect-bad'}`}>
                      {impact.learningDelta > 0 ? '+' : ''}{impact.learningDelta} Learning
                    </span>
                  )}
                  {impact.participationDelta !== undefined && impact.participationDelta !== 0 && (
                    <span className={`effect-tag ${impact.participationDelta > 0 ? 'effect-good' : 'effect-bad'}`}>
                      {impact.participationDelta > 0 ? '+' : ''}{impact.participationDelta} Participation
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Decision history with cross-game comparison */}
        {allChoiceRecords.length > 0 && (
          <div className="decisions-section">
            <h3 className="decisions-heading">Your Decisions</h3>
            <p className="decisions-subhead">How your choices compare to all players.</p>
            {allChoiceRecords.map((rec, i) => {
              const eventDef = EVENT_POOL.find(e => e.id === rec.eventId)
              if (!eventDef) return null

              // Text responses shown differently — full detail
              if (rec.responseType === 'text' || rec.choiceIndex < 0) {
                const fx = rec.claudeEffects || {}
                return (
                  <div key={i} className="decision-card decision-card-text">
                    <div className="decision-event-title">{rec.eventTitle}</div>
                    {rec.responseText && (
                      <blockquote className="decision-text-quote">"{rec.responseText}"</blockquote>
                    )}
                    {rec.claudeQuality && (
                      <div className={`text-response-quality quality-${rec.claudeQuality}`} style={{ alignSelf: 'flex-start' }}>
                        {rec.claudeQuality === 'excellent' ? '⭐ Excellent' : rec.claudeQuality === 'good' ? '✓ Good' : '✗ Poor'}
                      </div>
                    )}
                    {rec.claudeReasoning && (
                      <p className="decision-text-reasoning">{rec.claudeReasoning}</p>
                    )}
                    {rec.claudeFeedback && (
                      <p className="decision-text-feedback">{rec.claudeFeedback}</p>
                    )}
                    {(fx.participationDelta || fx.learningDelta || fx.popularityDelta) && (
                      <div className="text-response-effects">
                        {fx.participationDelta !== 0 && (
                          <span className={`effect-tag ${fx.participationDelta > 0 ? 'effect-good' : 'effect-bad'}`}>
                            {fx.participationDelta > 0 ? '+' : ''}{fx.participationDelta} Participation
                          </span>
                        )}
                        {fx.learningDelta !== 0 && (
                          <span className={`effect-tag ${fx.learningDelta > 0 ? 'effect-good' : 'effect-bad'}`}>
                            {fx.learningDelta > 0 ? '+' : ''}{fx.learningDelta} Learning
                          </span>
                        )}
                        {fx.popularityDelta !== 0 && (
                          <span className={`effect-tag ${fx.popularityDelta > 0 ? 'effect-good' : 'effect-bad'}`}>
                            {fx.popularityDelta > 0 ? '+' : ''}{fx.popularityDelta} Popularity
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              }

              const counts = eventCounts[rec.eventId] || {}
              const total = (eventDef.choices || []).reduce((s, _, ci) => s + (counts[String(ci)] || 0), 0)
              const hasData = total > 0

              return (
                <div key={i} className="decision-card">
                  <div className="decision-event-title">{rec.eventTitle}</div>
                  <div className="decision-choices">
                    {(eventDef.choices || []).map((choice, ci) => {
                      const count = counts[String(ci)] || 0
                      const pct = hasData ? Math.round(count / total * 100) : null
                      const isYours = ci === rec.choiceIndex

                      return (
                        <div key={ci} className={`decision-choice ${isYours ? 'decision-choice-yours' : ''}`}>
                          <div className="decision-choice-header">
                            <span className="decision-choice-label">{choice.label}</span>
                            {isYours && <span className="decision-yours-badge">Your choice</span>}
                            {hasData
                              ? <span className="decision-choice-pct">{pct}%</span>
                              : <span className="decision-choice-pct decision-first">first!</span>
                            }
                          </div>
                          {hasData && (
                            <div className="decision-bar-track">
                              <div
                                className={`decision-bar-fill ${isYours ? 'decision-bar-yours' : ''}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!wonGame && (
          <div className="retry-hint">
            Tip: Invest in audio equipment early — it helps every lecture from day one.
          </div>
        )}

        <button className="btn btn-primary btn-large" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  )
}
