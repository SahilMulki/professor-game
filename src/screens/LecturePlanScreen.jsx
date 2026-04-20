import { useState } from 'react'
import StatBar from '../components/StatBar.jsx'
import StarRating from '../components/StarRating.jsx'

function getPaceDescription(pace) {
  if (pace === 'slow') return 'Students absorb more. Better comprehension, slightly less content covered.'
  if (pace === 'fast') return 'Cover more ground. Struggling students may fall behind and disengage.'
  return 'Balanced coverage and comprehension. Safe choice.'
}

function getTheoryDescription(value) {
  if (value > 75) return 'Heavy on concepts. Learning jumps, but lower-performing students may tune out.'
  if (value > 50) return 'Concept-focused with some application. Good for building knowledge.'
  if (value === 50) return 'Even mix of theory and hands-on work.'
  if (value > 25) return 'Practice-forward. High engagement but lighter on concepts.'
  return 'Mostly hands-on. Great participation, but students may lack theoretical grounding.'
}

function getQaDescription(value) {
  if (value === 0) return 'No Q&A. Students may feel unheard.'
  if (value <= 5) return 'Quick check-in. Minimal disruption to lecture flow.'
  if (value <= 10) return 'Standard Q&A window. Good balance.'
  if (value <= 15) return 'Extended Q&A. Boosts participation but eats into content time.'
  return 'Heavy Q&A. Students feel heard, but little new material covered.'
}

function getGroupWorkDescription(value) {
  if (value === 0) return 'Individual learning only. Quiet classroom.'
  if (value <= 20) return 'Light group activity. Small participation boost.'
  if (value <= 35) return 'Moderate group work. Good energy if students like you.'
  return 'Heavy group work. Can backfire if your popularity is below 40%.'
}

export default function LecturePlanScreen({ gameState, onStart, onBack }) {
  const [plan, setPlan] = useState({ ...gameState.lecturePlan })
  const [showTips, setShowTips] = useState(false)

  const { participation, learning, popularity, inventory } = gameState

  const hasMic = inventory.basic_microphone || inventory.premium_microphone
  const hasSpeaker = inventory.speaker_system

  function update(key, value) {
    setPlan(p => ({ ...p, [key]: value }))
  }

  return (
    <div className="screen screen-lectureplan">
      <div className="lectureplan-header">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <h2>Plan Today's Lecture</h2>
        <div className="header-right">
          <div className="day-badge">Day {gameState.currentDay}</div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowTips(t => !t)}>
            {showTips ? 'Hide Tips' : 'Tips'}
          </button>
        </div>
      </div>

      <div className="lectureplan-body">
        <div className="stats-row">
          <StatBar label="Participation" value={participation} color="#38a169" />
          <StatBar label="Learning" value={learning} color="#3182ce" />
          <div className="stat-bar">
            <div className="stat-bar-header">
              <span className="stat-label">Popularity</span>
            </div>
            <StarRating value={popularity} />
          </div>
        </div>

        {showTips && (
          <div className="tips-panel">
            <div className="tips-panel-section">
              <strong>How Popularity Works</strong>
              <p>Popularity affects how engaged students are at the start of each lecture.</p>
              <div className="tips-two-col">
                <div className="tips-col tips-col-good">
                  <strong>Increases it</strong>
                  <ul>
                    <li>70%+ green seats at end of class</li>
                    <li>Choosing student-friendly event options</li>
                    <li>Slow or medium pace</li>
                    <li>Giving breaks and asking questions</li>
                  </ul>
                </div>
                <div className="tips-col tips-col-bad">
                  <strong>Decreases it</strong>
                  <ul>
                    <li>Most seats are red at end of class</li>
                    <li>Harsh event choices (calling students out)</li>
                    <li>Random bad events (reviews, accusations)</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="tips-panel-section">
              <strong>Lecture Strategy Tips</strong>
              <ul>
                <li>Audio equipment (mic + speakers) helps every single lecture — buy it early.</li>
                <li>Group work requires popularity above 40% to be effective.</li>
                <li>High theory without textbooks or slides leads to confusion.</li>
                <li>Q&A time boosts participation but reduces content coverage.</li>
                <li>Slow pace helps struggling students; fast pace helps already-engaged classes.</li>
                <li>Use "Speed Up" mid-lecture when seats are green; "Slow Down" when they turn red.</li>
              </ul>
            </div>
          </div>
        )}

        <div className="plan-controls">
          <div className="plan-control">
            <div className="control-header">
              <label>Theory vs. Practice</label>
              <span className="control-value">
                {plan.theoryVsPractice <= 50
                  ? `${100 - plan.theoryVsPractice}% Practice`
                  : `${plan.theoryVsPractice}% Theory`}
              </span>
            </div>
            <div className="slider-labels">
              <span>All Practice</span>
              <span>All Theory</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={plan.theoryVsPractice}
              onChange={e => update('theoryVsPractice', Number(e.target.value))}
              className="slider"
            />
            <p className="control-hint">{getTheoryDescription(plan.theoryVsPractice)}</p>
          </div>

          <div className="plan-control">
            <div className="control-header">
              <label>Lecture Pace</label>
              <span className="control-value">{plan.pace.charAt(0).toUpperCase() + plan.pace.slice(1)}</span>
            </div>
            <div className="pace-buttons">
              {['slow', 'medium', 'fast'].map(p => (
                <button
                  key={p}
                  className={`btn btn-pace ${plan.pace === p ? 'btn-pace-active' : ''}`}
                  onClick={() => update('pace', p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            <p className="control-hint">{getPaceDescription(plan.pace)}</p>
          </div>

          <div className="plan-control">
            <div className="control-header">
              <label>Q&A Time</label>
              <span className="control-value">{plan.qaTime} min</span>
            </div>
            <div className="slider-labels">
              <span>0 min</span>
              <span>20 min</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="5"
              value={plan.qaTime}
              onChange={e => update('qaTime', Number(e.target.value))}
              className="slider"
            />
            <p className="control-hint">{getQaDescription(plan.qaTime)}</p>
          </div>

          <div className="plan-control">
            <div className="control-header">
              <label>Group Work</label>
              <span className="control-value">{plan.groupWork}%</span>
            </div>
            <div className="slider-labels">
              <span>None</span>
              <span>50%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="10"
              value={plan.groupWork}
              onChange={e => update('groupWork', Number(e.target.value))}
              className="slider"
            />
            {popularity < 40 && plan.groupWork > 0 && (
              <p className="control-warning">Popularity is {popularity}% — group work may backfire below 40%.</p>
            )}
            <p className="control-hint">{getGroupWorkDescription(plan.groupWork)}</p>
          </div>
        </div>

        {(hasMic || hasSpeaker) && (
          <div className="equipment-status">
            <strong>Active Audio Equipment:</strong>
            {hasMic && <span className="equip-badge">{inventory.premium_microphone ? 'Premium Mic' : 'Basic Mic'}</span>}
            {hasSpeaker && <span className="equip-badge">Speaker System</span>}
          </div>
        )}
      </div>

      <div className="lectureplan-footer">
        <button className="btn btn-primary btn-large" onClick={() => onStart(plan)}>
          Start Lecture
        </button>
      </div>
    </div>
  )
}
