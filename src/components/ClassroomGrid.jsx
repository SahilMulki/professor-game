import StudentSeat from './StudentSeat.jsx'
import { SEATS_PER_ROW } from '../constants.js'

export default function ClassroomGrid({ seatStates }) {
  const rows = []
  for (let r = 0; r < seatStates.length / SEATS_PER_ROW; r++) {
    rows.push(seatStates.slice(r * SEATS_PER_ROW, (r + 1) * SEATS_PER_ROW))
  }

  return (
    <div className="classroom">
      <div className="classroom-front">
        <div className="whiteboard">WHITEBOARD</div>
        <div className="professor">🧑‍🏫 Professor</div>
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
