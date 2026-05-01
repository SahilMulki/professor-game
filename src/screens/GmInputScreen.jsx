import { useState } from 'react'
import { ITEMS, LECTURE_PLAN_DEFAULTS } from '../constants.js'

// Returns true if the item was owned at the start of today (locked — can't un-buy)
function isPriorOwned(item, gameStateInventory) {
  if (item.consumable) return false
  return !!gameStateInventory[item.id]
}

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

const CATEGORIES = ['supplies', 'audio', 'environment', 'technology']
const CATEGORY_LABELS = {
  supplies: 'Supplies',
  audio: 'Audio Equipment',
  environment: 'Environment',
  technology: 'Technology',
}

export default function GmInputScreen({ gameState, onReady }) {
  const [inventory, setInventory] = useState({ ...gameState.inventory })
  const [plan, setPlan] = useState({ ...gameState.lecturePlan })

  const { currentDay, totalDays, money, popularity } = gameState

  // Compute how much the players have spent today (newly acquired items vs. starting inventory)
  const spentToday = ITEMS.reduce((total, item) => {
    const prev = gameState.inventory[item.id]
    const curr = inventory[item.id]
    if (item.consumable) {
      return total + Math.max(0, (curr || 0) - (prev || 0)) * item.price
    }
    return total + (!prev && curr ? item.price : 0)
  }, 0)
  const remaining = money - spentToday
  const overBudget = remaining < 0

  function toggleItem(item) {
    setInventory(prev => {
      const next = { ...prev }

      if (item.consumable) {
        next[item.id] = (prev[item.id] || 0) + 1
        return next
      }

      // Locked from a prior day — can't change
      if (isPriorOwned(item, gameState.inventory)) return next

      if (prev[item.id]) {
        // Checked today — allow uncheck; cascade to dependents also checked today
        next[item.id] = false
        ITEMS.forEach(other => {
          if (!isPriorOwned(other, gameState.inventory)) {
            if (other.requires === item.id || other.upgrades === item.id) {
              next[other.id] = false
            }
          }
        })
        return next
      }

      // Enforce requires dependency
      if (item.requires && !prev[item.requires]) return next

      next[item.id] = true
      return next
    })
  }

  function removeConsumable(itemId) {
    setInventory(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) - 1),
    }))
  }

  function isOwned(item) {
    if (item.consumable) return (inventory[item.id] || 0) > 0
    return !!inventory[item.id]
  }

  function isBlocked(item) {
    if (item.requires && !inventory[item.requires]) return true
    if (item.upgrades && !inventory[item.upgrades]) return true
    return false
  }

  function updatePlan(key, value) {
    setPlan(p => ({ ...p, [key]: value }))
  }

  const hasMic = inventory.basic_microphone || inventory.premium_microphone
  const hasSpeaker = inventory.speaker_system

  return (
    <div className="screen screen-gminput">
      <div className="gminput-header">
        <div className="gm-badge">GAME MASTER</div>
        <h2>Day {currentDay} of {totalDays} — Pre-Lecture Setup</h2>
        <div className="gminput-money">
          <span>Budget: <strong>${money}</strong></span>
          <span className={`gminput-remaining ${overBudget ? 'over-budget' : ''}`}>
            {overBudget ? `Over by $${-remaining}` : `Remaining: $${remaining}`}
          </span>
        </div>
      </div>

      <div className="gminput-body">
        {/* ── ITEMS SECTION ── */}
        <section className="gminput-section">
          <h3 className="section-heading">Items Purchased</h3>
          <p className="section-hint">Check off items the players bought with paper money. Already-owned items are shown but cannot be un-bought.</p>

          {CATEGORIES.map(cat => {
            const items = ITEMS.filter(i => i.category === cat)
            return (
              <div key={cat} className="item-category">
                <div className="item-category-label">{CATEGORY_LABELS[cat]}</div>
                <div className="item-list">
                  {items.map(item => {
                    const owned = isOwned(item)
                    const locked = isPriorOwned(item, gameState.inventory)
                    const blocked = !owned && isBlocked(item)

                    return (
                      <div
                        key={item.id}
                        className={`item-row ${locked ? 'item-owned' : ''} ${blocked ? 'item-blocked' : ''}`}
                      >
                        <label className="item-check-label">
                          <input
                            type="checkbox"
                            checked={owned}
                            disabled={locked || (item.consumable && false)}
                            onChange={() => {
                              if (!locked && !blocked) toggleItem(item)
                            }}
                          />
                          <span className="item-name">{item.name}</span>
                          <span className="item-price">${item.price}</span>
                          {item.consumable && owned && (
                            <span className="item-consumable-count">
                              ×{inventory[item.id]}
                              <button
                                className="btn-tiny"
                                onClick={() => removeConsumable(item.id)}
                              >−</button>
                              <button
                                className="btn-tiny"
                                onClick={() => toggleItem(item)}
                              >+</button>
                            </span>
                          )}
                        </label>
                        <span className="item-effect">{item.effect}</span>
                        {item.requires && !inventory[item.requires] && (
                          <span className="item-requires-note">Requires {ITEMS.find(i => i.id === item.requires)?.name}</span>
                        )}
                        {item.upgrades && !inventory[item.upgrades] && (
                          <span className="item-requires-note">Requires {ITEMS.find(i => i.id === item.upgrades)?.name} first</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>

        {/* ── LECTURE PLAN SECTION ── */}
        <section className="gminput-section">
          <h3 className="section-heading">Lecture Plan</h3>
          <p className="section-hint">Input the players' decisions from their paper lecture planning sheets.</p>

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
                onChange={e => updatePlan('theoryVsPractice', Number(e.target.value))}
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
                    onClick={() => updatePlan('pace', p)}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              <p className="control-hint">{getPaceDescription(plan.pace)}</p>
            </div>

            <div className="plan-control">
              <div className="control-header">
                <label>Q&amp;A Time</label>
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
                onChange={e => updatePlan('qaTime', Number(e.target.value))}
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
                onChange={e => updatePlan('groupWork', Number(e.target.value))}
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
        </section>
      </div>

      <div className="gminput-footer">
        <button
          className="btn btn-primary btn-large"
          onClick={() => onReady({ inventory, lecturePlan: plan, moneySpent: spentToday })}
        >
          Run Simulation
        </button>
      </div>
    </div>
  )
}
