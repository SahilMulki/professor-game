function effectLabel(key, val) {
  const names = { participation: 'Participation', learning: 'Learning', popularity: 'Popularity' }
  return names[key] || key
}

export default function EventOverlay({ event, onChoose }) {
  if (!event) return null

  const hasPositiveEffect = (choice) =>
    Object.entries(choice.effects || {}).some(([k, v]) => typeof v === 'number' && v > 0)

  return (
    <div className="event-overlay">
      <div className="event-card event-choice-card">
        <div className="event-title">{event.title}</div>
        <p className="event-desc">{event.description}</p>
        <p className="event-prompt">How do you respond?</p>
        <div className="event-choices">
          {event.choices.map((choice, i) => (
            <button
              key={i}
              className="choice-btn"
              onClick={() => onChoose(event, choice)}
            >
              <span className="choice-label">{choice.label}</span>
              <span className="choice-desc">{choice.description}</span>
              <span className="choice-effects">
                {Object.keys(choice.effects || {}).length === 0
                  ? <span className="effect-tag effect-neutral">No effect</span>
                  : Object.entries(choice.effects).map(([key, val]) => {
                      if (key === 'disableAudio') return <span key={key} className="effect-tag effect-bad">Audio disabled</span>
                      if (typeof val !== 'number') return null
                      return (
                        <span key={key} className={`effect-tag ${val > 0 ? 'effect-good' : 'effect-bad'}`}>
                          {val > 0 ? '+' : ''}{val} {effectLabel(key, val)}
                        </span>
                      )
                    })
                }
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
