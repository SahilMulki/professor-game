import { useState } from 'react'
import { ITEMS } from '../constants.js'

const CATEGORY_LABELS = {
  supplies: 'Supplies',
  audio: 'Audio Equipment',
  environment: 'Environment',
  technology: 'Technology',
}

function groupByCategory(items) {
  const groups = {}
  for (const item of items) {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  }
  return groups
}

function getTips(gameState) {
  const { participation, learning, popularity, inventory, currentDay, totalDays } = gameState
  const tips = []

  if (popularity < 40) {
    tips.push({
      title: 'Low Popularity',
      text: 'Avoid group work until popularity is above 40. Slow-paced, engaging lectures build trust over time.',
      type: 'warning',
    })
  }
  if (!inventory.basic_microphone && !inventory.premium_microphone) {
    tips.push({
      title: 'No Microphone',
      text: 'Back-row students struggle to hear you without a mic. A basic mic ($150) is one of the best early investments.',
      type: 'info',
    })
  }
  if (inventory.basic_microphone && !inventory.speaker_system) {
    tips.push({
      title: 'Add Speakers',
      text: 'Your mic is good, but a speaker system ($300) amplifies its effect across the whole room.',
      type: 'info',
    })
  }
  if (learning < participation - 15 && learning < 50) {
    tips.push({
      title: 'Students Are Engaged but Not Learning',
      text: 'Shift toward more theory in your lecture plan. Textbooks (+8 Learning) and visual aids are your best tools.',
      type: 'info',
    })
  }
  if (participation < learning - 15 && participation < 50) {
    tips.push({
      title: 'Students Are Learning but Not Participating',
      text: 'More practice-focused lectures, Q&A time, and group work can boost participation.',
      type: 'info',
    })
  }
  if (currentDay > Math.ceil(totalDays * 0.6) && participation < 60) {
    tips.push({
      title: 'Running Out of Time',
      text: 'Focus on participation boosters — coffee station, comfortable seating, and ask questions in every lecture.',
      type: 'warning',
    })
  }
  if (tips.length === 0) {
    tips.push({
      title: 'Good Progress',
      text: "Keep investing in equipment and tune your lecture style to the class's needs. Group work really pays off once popularity is high.",
      type: 'success',
    })
  }
  return tips.slice(0, 3)
}

export default function InventoryScreen({ gameState, onNext, onHelp }) {
  const { money, inventory, currentDay, totalDays } = gameState
  const [pendingPurchases, setPendingPurchases] = useState({})

  const pendingCost = Object.entries(pendingPurchases).reduce((sum, [id, qty]) => {
    const item = ITEMS.find(i => i.id === id)
    return sum + item.price * qty
  }, 0)
  const remaining = money - pendingCost

  function isOwned(item) {
    if (item.consumable) return false
    return !!inventory[item.id]
  }

  function isPendingBuy(id) {
    return (pendingPurchases[id] || 0) > 0
  }

  function isLocked(item) {
    if (item.requires && !inventory[item.requires] && !isPendingBuy(item.requires)) return true
    if (item.upgrades && !inventory[item.upgrades] && !isPendingBuy(item.upgrades)) return true
    return false
  }

  function handleAdd(item) {
    if (isOwned(item) || isLocked(item)) return
    if (remaining < item.price) return
    if (!item.consumable && isPendingBuy(item.id)) return
    setPendingPurchases(p => ({ ...p, [item.id]: (p[item.id] || 0) + 1 }))
  }

  function handleRemove(item) {
    setPendingPurchases(p => {
      const qty = (p[item.id] || 0) - 1
      if (qty <= 0) {
        const next = { ...p }
        delete next[item.id]
        return next
      }
      return { ...p, [item.id]: qty }
    })
  }

  function handleConfirm() {
    const updatedInventory = { ...inventory }
    for (const [id, qty] of Object.entries(pendingPurchases)) {
      const item = ITEMS.find(i => i.id === id)
      if (item.consumable) {
        updatedInventory[id] = (updatedInventory[id] || 0) + qty
      } else {
        updatedInventory[id] = true
        if (item.upgrades) updatedInventory[item.upgrades] = true
      }
    }
    onNext(updatedInventory, pendingCost)
  }

  const grouped = groupByCategory(ITEMS)
  const tips = getTips(gameState)

  return (
    <div className="screen screen-inventory">
      <div className="inventory-header">
        <div className="header-info">
          <div className="day-badge">Day {currentDay} of {totalDays}</div>
          <div className="money-display">
            <span className="money-label">Available</span>
            <span className={`money-amount ${remaining < 0 ? 'money-negative' : ''}`}>
              ${remaining.toLocaleString()}
            </span>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={onHelp}>? Help</button>
      </div>

      <div className="inventory-body">
        <h2>Shop for Supplies</h2>
        <p className="screen-subtitle">Invest your daily salary to improve your classroom.</p>

        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="item-category">
            <h3 className="category-label">{CATEGORY_LABELS[category]}</h3>
            <div className="item-grid">
              {items.map(item => {
                const owned = isOwned(item)
                const locked = isLocked(item)
                const inCart = pendingPurchases[item.id] || 0
                const canAffordOne = remaining >= item.price
                const stockLabel = item.consumable && inventory[item.id] > 0
                  ? `In stock: ${inventory[item.id]}`
                  : null

                return (
                  <div
                    key={item.id}
                    className={`item-card ${owned ? 'item-owned' : ''} ${locked ? 'item-locked' : ''} ${inCart > 0 ? 'item-in-cart' : ''}`}
                  >
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">${item.price}{item.consumable ? '/use' : ''}</div>
                    <div className="item-effect">{item.effect}</div>
                    {stockLabel && <div className="item-stock">{stockLabel}</div>}
                    {locked && (
                      <div className="item-lock-reason">
                        Requires {item.requires === 'basic_microphone' || item.upgrades === 'basic_microphone' ? 'Basic Microphone' : 'prerequisite'}
                      </div>
                    )}

                    <div className="item-actions">
                      {owned && <span className="item-owned-badge">Owned</span>}

                      {!owned && !locked && !item.consumable && (
                        inCart > 0
                          ? <span className="item-added-badge">Added to cart</span>
                          : <button
                              className="btn btn-sm btn-primary"
                              disabled={!canAffordOne}
                              onClick={() => handleAdd(item)}
                            >
                              Buy — ${item.price}
                            </button>
                      )}

                      {!owned && !locked && item.consumable && (
                        <div className="qty-stepper">
                          <button
                            className="btn btn-sm btn-ghost qty-btn"
                            disabled={inCart === 0}
                            onClick={() => handleRemove(item)}
                          >−</button>
                          <span className="qty-value">{inCart}</span>
                          <button
                            className="btn btn-sm btn-primary qty-btn"
                            disabled={!canAffordOne}
                            onClick={() => handleAdd(item)}
                          >+</button>
                          {inCart === 0 && (
                            <span className="qty-price">${item.price} each</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div className="tips-section">
          <h3 className="tips-heading">Today's Advice</h3>
          <div className="tips-list">
            {tips.map((tip, i) => (
              <div key={i} className={`tip-card tip-${tip.type}`}>
                <strong className="tip-title">{tip.title}</strong>
                <p className="tip-text">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="inventory-footer">
        {pendingCost > 0 && (
          <div className="cart-summary">
            Cart: <strong>${pendingCost}</strong> — Remaining after purchase: <strong>${remaining}</strong>
          </div>
        )}
        <button className="btn btn-primary btn-large" onClick={handleConfirm}>
          Go to Lecture Plan
        </button>
      </div>
    </div>
  )
}
