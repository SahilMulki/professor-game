import { TOTAL_DAYS } from '../constants.js'

export default function GmStartScreen({ onBegin }) {
  return (
    <div className="screen screen-gmstart">
      <div className="gmstart-content">
        <div className="gm-badge">GAME MASTER</div>
        <h1 className="gmstart-title">Professor Game</h1>
        <p className="gmstart-subtitle">{TOTAL_DAYS}-Day Semester Simulation</p>

        <div className="gmstart-info">
          <div className="gmstart-info-item">
            <span className="gmstart-info-label">Starting Budget</span>
            <span className="gmstart-info-value">$500</span>
          </div>
          <div className="gmstart-info-item">
            <span className="gmstart-info-label">Daily Salary</span>
            <span className="gmstart-info-value">$500 / day</span>
          </div>
          <div className="gmstart-info-item">
            <span className="gmstart-info-label">Win Condition</span>
            <span className="gmstart-info-value">Participation + Learning ≥ 100%</span>
          </div>
        </div>

        <p className="gmstart-note">
          Give players the intro handouts. When ready, click Begin to open Day 1 inputs.
        </p>

        <button className="btn btn-primary btn-large" onClick={onBegin}>
          Begin Day 1
        </button>
      </div>
    </div>
  )
}
