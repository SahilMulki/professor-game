const VARIANTS = [
  { engaged: '😊', neutral: '😐', disengaged: '😴' },
  { engaged: '🙂', neutral: '😑', disengaged: '🥱' },
  { engaged: '😁', neutral: '😶', disengaged: '😪' },
]

export default function StudentSeat({ state, index }) {
  const variant = VARIANTS[index % 3]
  const emoji = variant[state]
  return (
    <div className={`student-seat seat-${state}`} title={`Student ${index + 1}: ${state}`}>
      <span className="seat-emoji">{emoji}</span>
      {state === 'disengaged' && <span className="seat-zzz">💤</span>}
    </div>
  )
}
