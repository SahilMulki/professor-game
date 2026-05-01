import { useState } from 'react'
import { STARTING_STATS, LECTURE_PLAN_DEFAULTS, TOTAL_DAYS, STARTING_MONEY, DAILY_SALARY } from './constants.js'
import GmStartScreen from './screens/GmStartScreen.jsx'
import GmInputScreen from './screens/GmInputScreen.jsx'
import GmSummaryScreen from './screens/GmSummaryScreen.jsx'
import SimulationScreen from './screens/SimulationScreen.jsx'
import FinalScoreScreen from './screens/FinalScoreScreen.jsx'
import './styles/global.css'

function buildInitialInventory() {
  return {
    whiteboard_markers: false,
    printed_handouts: 0,
    laser_pointer: false,
    online_resources: false,
    visual_aids: false,
    basic_microphone: false,
    coffee_station: false,
    course_textbooks: false,
    speaker_system: false,
    comfortable_seating: false,
    premium_microphone: false,
    interactive_whiteboard: false,
  }
}

function buildInitialState() {
  return {
    screen: 'gmStart',
    totalDays: TOTAL_DAYS,
    currentDay: 1,
    ...STARTING_STATS,
    money: STARTING_MONEY,
    inventory: buildInitialInventory(),
    lecturePlan: { ...LECTURE_PLAN_DEFAULTS },
    lastLectureResult: null,
    dayHistory: [],
    hiddenImpacts: [],
    wonGame: false,
  }
}

export default function App() {
  const [gameState, setGameState] = useState(buildInitialState)

  function updateGameState(patch) {
    setGameState(prev => ({ ...prev, ...patch }))
  }

  function resetGame() {
    setGameState(buildInitialState())
  }

  const { screen } = gameState

  // GM submits items bought + lecture plan → go to simulation
  function handleGmInputReady({ inventory, lecturePlan, moneySpent }) {
    updateGameState({
      screen: 'simulation',
      inventory,
      lecturePlan,
      money: Math.max(0, gameState.money - (moneySpent || 0)),
    })
  }

  // Simulation ends → go to GM summary
  function handleSimulationEnd(result) {
    updateGameState({
      screen: 'gmSummary',
      lastLectureResult: result,
    })
  }

  // GM advances from summary → next day or final screen
  function handleSummaryNext() {
    const result = gameState.lastLectureResult
    const newParticipation = Math.min(100, Math.max(0, gameState.participation + (result.participationDelta || 0)))
    const newLearning = Math.min(100, Math.max(0, gameState.learning + (result.learningDelta || 0)))
    const newPopularity = Math.min(100, Math.max(0, gameState.popularity + (result.popularityDelta || 0)))
    const won = newParticipation >= 100 && newLearning >= 100
    const nextDay = gameState.currentDay + 1
    const gameOver = nextDay > gameState.totalDays && !won

    const newHistory = [...gameState.dayHistory, result]
    const newHiddenImpacts = [...gameState.hiddenImpacts, ...(result.hiddenImpacts || [])]

    // Decrement consumable handouts
    const updatedInventory = { ...gameState.inventory }
    if (updatedInventory.printed_handouts > 0) {
      updatedInventory.printed_handouts -= 1
    }

    if (won || gameOver) {
      setGameState(prev => ({
        ...prev,
        participation: newParticipation,
        learning: newLearning,
        popularity: newPopularity,
        inventory: updatedInventory,
        dayHistory: newHistory,
        hiddenImpacts: newHiddenImpacts,
        wonGame: won,
        screen: 'finalScore',
      }))
    } else {
      setGameState(prev => ({
        ...prev,
        participation: newParticipation,
        learning: newLearning,
        popularity: newPopularity,
        currentDay: nextDay,
        money: prev.money + DAILY_SALARY,
        inventory: updatedInventory,
        dayHistory: newHistory,
        hiddenImpacts: newHiddenImpacts,
        screen: 'gmInput',
      }))
    }
  }

  return (
    <div className="app">
      {screen === 'gmStart' && (
        <GmStartScreen onBegin={() => updateGameState({ screen: 'gmInput' })} />
      )}
      {screen === 'gmInput' && (
        <GmInputScreen
          gameState={gameState}
          onReady={handleGmInputReady}
        />
      )}
      {screen === 'simulation' && (
        <SimulationScreen
          gameState={gameState}
          onEnd={handleSimulationEnd}
        />
      )}
      {screen === 'gmSummary' && (
        <GmSummaryScreen
          gameState={gameState}
          onNext={handleSummaryNext}
        />
      )}
      {screen === 'finalScore' && (
        <FinalScoreScreen
          gameState={gameState}
          onPlayAgain={resetGame}
        />
      )}
    </div>
  )
}
