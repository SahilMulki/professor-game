export default function StudentSeat({ state, index }) {
  const emoji = state === 'engaged' ? '😊' : state === 'neutral' ? '😐' : '😴'
  return (
    <div className={`student-seat seat-${state}`} title={`Student ${index + 1}: ${state}`}>
      <span className="seat-emoji">{emoji}</span>
    </div>
  )
}
