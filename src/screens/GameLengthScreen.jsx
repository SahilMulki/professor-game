const OPTIONS = [
  {
    days: 3,
    label: '3 Days',
    difficulty: 'Hard',
    description: 'Lightning round. Every purchase and lecture decision counts. Only for the bold.',
    color: '#e53e3e',
  },
  {
    days: 7,
    label: '7 Days',
    difficulty: 'Normal',
    description: 'A full work week. Plenty of time to find your teaching style and invest wisely.',
    color: '#3182ce',
  },
  {
    days: 14,
    label: '14 Days',
    difficulty: 'Easy',
    description: 'Two weeks to build the perfect classroom. Great for learning the game.',
    color: '#38a169',
  },
]

export default function GameLengthScreen({ onSelect }) {
  return (
    <div className="screen screen-gamelength">
      <div className="screen-content">
        <h1>How long is the semester?</h1>
        <p className="screen-subtitle">Choose how many days you have to reach 100% Participation and Learning.</p>

        <div className="option-cards">
          {OPTIONS.map((opt) => (
            <button
              key={opt.days}
              className="option-card"
              onClick={() => onSelect(opt.days)}
              style={{ '--accent': opt.color }}
            >
              <div className="option-days">{opt.label}</div>
              <div className="option-difficulty" style={{ color: opt.color }}>{opt.difficulty}</div>
              <div className="option-desc">{opt.description}</div>
              <div className="option-salary">
                Salary: <strong>${(opt.days * 500).toLocaleString()} total</strong>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
