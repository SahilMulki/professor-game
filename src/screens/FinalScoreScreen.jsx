import { computeScore } from '../gameLogic.js'
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

export default function FinalScoreScreen({ gameState, onPlayAgain }) {
  const { participation, learning, popularity, currentDay, totalDays, wonGame, dayHistory } = gameState
  const { grade, message } = computeScore(wonGame, currentDay, totalDays, participation, learning)
  const gradeColor = GRADE_COLORS[grade]

  const avgEngagement = dayHistory.length > 0
    ? Math.round(dayHistory.reduce((s, d) => s + d.finalEngagementRatio, 0) / dayHistory.length * 100)
    : 0

  const totalEvents = dayHistory.reduce((s, d) => s + d.eventsTriggered.length, 0)

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
          <StatBar label="Final Participation" value={participation} color="#38a169" />
          <StatBar label="Final Learning" value={learning} color="#3182ce" />
          <div className="popularity-row">
            <span>Final Popularity</span>
            <StarRating value={popularity} />
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
