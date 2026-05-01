import StudentSeat from './StudentSeat.jsx'
import { SEATS_PER_ROW } from '../constants.js'

function getAmbientBg(ratio) {
  if (ratio >= 0.65) return '#edfdf3'  // engaged: calm green tint
  if (ratio >= 0.35) return '#fdfdf0'  // neutral: warm yellow tint
  return '#fdf2f2'                      // disengaged: stressed red tint
}

export default function ClassroomGrid({ seatStates, isEventActive }) {
  const rows = []
  for (let r = 0; r < seatStates.length / SEATS_PER_ROW; r++) {
    rows.push(seatStates.slice(r * SEATS_PER_ROW, (r + 1) * SEATS_PER_ROW))
  }

  const engagedCount = seatStates.filter(s => s === 'engaged').length
  const ratio = engagedCount / seatStates.length

  return (
    <div
      className="classroom"
      style={{ background: getAmbientBg(ratio), transition: 'background 3s ease' }}
    >
      <div className="classroom-front">
        <div className="whiteboard">WHITEBOARD</div>
        <div className={`professor ${isEventActive ? 'professor-alert' : ''}`}>
          {isEventActive ? '😯' : '🧑‍🏫'} Professor
        </div>
      </div>
      <div className="classroom-rows">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="classroom-row">
            <span className="row-label">Row {rowIdx + 1}</span>
            {row.map((state, seatIdx) => (
              <StudentSeat
                key={seatIdx}
                state={state}
                index={rowIdx * SEATS_PER_ROW + seatIdx}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="classroom-legend">
        <span className="legend-item"><span className="legend-dot dot-engaged" />Engaged</span>
        <span className="legend-item"><span className="legend-dot dot-neutral" />Neutral</span>
        <span className="legend-item"><span className="legend-dot dot-disengaged" />Disengaged</span>
      </div>
    </div>
  )
}
