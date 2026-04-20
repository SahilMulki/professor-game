const ACTIONS = [
  { id: 'slowDown', label: 'Slow Down', description: 'Ease the pace. Students catch up.', cooldown: 10 },
  { id: 'speedUp', label: 'Speed Up', description: 'Cover more material. Engagement drops slightly.', cooldown: 8 },
  { id: 'askClass', label: 'Ask the Class', description: 'Call on a student. Engagement spikes.', cooldown: 8 },
  { id: 'writeBoard', label: 'Write on Board', description: 'Highlight a key point visually.', cooldown: 5 },
  { id: 'giveBreak', label: 'Give a Break', description: 'Quick mental reset for tired students.', cooldown: 15 },
]

export default function MidLecturePanel({ onAction, lastUsed }) {
  return (
    <div className="mid-lecture-panel">
      <div className="panel-title">Mid-Lecture Adjustments</div>
      <div className="action-buttons">
        {ACTIONS.map(action => {
          const minutesSince = lastUsed[action.id] !== undefined ? lastUsed[action.id] : Infinity
          const onCooldown = minutesSince < action.cooldown

          return (
            <button
              key={action.id}
              className={`btn btn-action ${onCooldown ? 'btn-action-cooldown' : ''}`}
              disabled={onCooldown}
              onClick={() => onAction(action.id)}
              title={action.description}
            >
              <span className="action-label">{action.label}</span>
              <span className="action-desc">{action.description}</span>
              {onCooldown && (
                <span className="action-cooldown">{action.cooldown - minutesSince}m cooldown</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
