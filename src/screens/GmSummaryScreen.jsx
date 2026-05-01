import StatBar from '../components/StatBar.jsx'

function DeltaBadge({ value }) {
  if (value === undefined || value === null) return null
  const sign = value > 0 ? '+' : ''
  const cls = value > 0 ? 'delta-good' : value < 0 ? 'delta-bad' : 'delta-neutral'
  return <span className={`delta-badge ${cls}`}>{sign}{Math.round(value)}</span>
}

export default function GmSummaryScreen({ gameState, onNext }) {
  const { currentDay, totalDays, participation, learning, popularity, money, inventory, lastLectureResult } = gameState
  const result = lastLectureResult || {}

  // These are the values BEFORE today (current gameState hasn't been updated yet)
  const oldP = participation
  const oldL = learning
  const oldPop = popularity

  // What the values will become after applying deltas
  const newP = Math.min(100, Math.max(0, oldP + (result.participationDelta || 0)))
  const newL = Math.min(100, Math.max(0, oldL + (result.learningDelta || 0)))
  const newPop = Math.min(100, Math.max(0, oldPop + (result.popularityDelta || 0)))

  const isLastDay = currentDay >= totalDays
  const won = newP >= 100 && newL >= 100

  const handouts = inventory.printed_handouts || 0
  const handoutsAfter = Math.max(0, handouts - 1)

  const eventsThisDay = result.eventsTriggered || []

  return (
    <div className="screen screen-gmsummary">
      <div className="screen-content">
        <div className="gmsummary-header">
          <div className="gm-badge">GAME MASTER</div>
          <h2>Day {currentDay} Summary</h2>
          <p className="gmsummary-subhead">Private view — take back the laptop before continuing.</p>
        </div>

        <div className="gmsummary-stats">
          <div className="summary-stat-row">
            <span className="summary-stat-label">Participation</span>
            <div className="summary-stat-values">
              <span className="summary-stat-prev">{Math.round(oldP)}%</span>
              <span className="summary-stat-arrow">→</span>
              <span className="summary-stat-now">{Math.round(newP)}%</span>
              <DeltaBadge value={result.participationDelta} />
            </div>
          </div>
          <div className="summary-stat-row">
            <span className="summary-stat-label">Learning</span>
            <div className="summary-stat-values">
              <span className="summary-stat-prev">{Math.round(oldL)}%</span>
              <span className="summary-stat-arrow">→</span>
              <span className="summary-stat-now">{Math.round(newL)}%</span>
              <DeltaBadge value={result.learningDelta} />
            </div>
          </div>
          <div className="summary-stat-row">
            <span className="summary-stat-label">Popularity</span>
            <div className="summary-stat-values">
              <span className="summary-stat-prev">{Math.round(oldPop)}%</span>
              <span className="summary-stat-arrow">→</span>
              <span className="summary-stat-now">{Math.round(newPop)}%</span>
              <DeltaBadge value={result.popularityDelta} />
            </div>
          </div>
          <div className="summary-stat-row">
            <span className="summary-stat-label">Money</span>
            <div className="summary-stat-values">
              <span className="summary-stat-now">${money}</span>
              {!isLastDay && !won && <span className="summary-stat-note">+$500 next day</span>}
            </div>
          </div>
        </div>

        {result.finalEngagementRatio !== undefined && (
          <div className="gmsummary-engagement">
            <span className="summary-stat-label">Class Engagement</span>
            <span className="summary-stat-now">{Math.round(result.finalEngagementRatio * 100)}%</span>
          </div>
        )}

        {eventsThisDay.length > 0 && (
          <div className="gmsummary-events">
            <div className="summary-stat-label">Events This Lecture</div>
            {eventsThisDay.map((e, i) => (
              <div key={i} className="gmsummary-event-item">🎲 {e.title}</div>
            ))}
          </div>
        )}

        {handouts > 0 && (
          <div className="gmsummary-consumable-note">
            Printed Handouts: {handouts} → {handoutsAfter} remaining after today.
          </div>
        )}

        {won && (
          <div className="gmsummary-win-banner">
            🎉 Both stats hit 100%! The semester is complete.
          </div>
        )}

        <div className="gmsummary-footer">
          {won || isLastDay ? (
            <button className="btn btn-primary btn-large" onClick={onNext}>
              View Final Results
            </button>
          ) : (
            <button className="btn btn-primary btn-large" onClick={onNext}>
              Start Day {currentDay + 1}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
