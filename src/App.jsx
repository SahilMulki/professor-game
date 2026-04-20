import { useState } from 'react'
import { STARTING_STATS, LECTURE_PLAN_DEFAULTS, SEAT_COUNT } from './constants.js'
import WelcomeScreen from './screens/WelcomeScreen.jsx'
import GameLengthScreen from './screens/GameLengthScreen.jsx'
import InventoryScreen from './screens/InventoryScreen.jsx'
import LecturePlanScreen from './screens/LecturePlanScreen.jsx'
import SimulationScreen from './screens/SimulationScreen.jsx'
import PostLectureScreen from './screens/PostLectureScreen.jsx'
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
    screen: 'welcome',
    totalDays: 7,
    currentDay: 1,
    ...STARTING_STATS,
    money: 0,
    inventory: buildInitialInventory(),
    lecturePlan: { ...LECTURE_PLAN_DEFAULTS },
    simulation: {
      minutesElapsed: 0,
      isPaused: false,
      speed: 1,
      seatStates: Array(SEAT_COUNT).fill('neutral'),
      activeEvent: null,
      midLectureLog: [],
      audioDisabled: false,
    },
    lastLectureResult: null,
    dayHistory: [],
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

  return (
    <div className="app">
      {screen === 'welcome' && (
        <WelcomeScreen onNext={() => updateGameState({ screen: 'gameLength' })} />
      )}
      {screen === 'gameLength' && (
        <GameLengthScreen
          onSelect={(days) => {
            const fresh = buildInitialState()
            setGameState({
              ...fresh,
              screen: 'inventory',
              totalDays: days,
              money: 500,
            })
          }}
        />
      )}
      {screen === 'inventory' && (
        <InventoryScreen
          gameState={gameState}
          onNext={(updatedInventory, moneySpent) =>
            updateGameState({
              screen: 'lecturePlan',
              inventory: updatedInventory,
              money: gameState.money - moneySpent,
            })
          }
          onHelp={() => updateGameState({ screen: 'welcome' })}
        />
      )}
      {screen === 'lecturePlan' && (
        <LecturePlanScreen
          gameState={gameState}
          onStart={(plan) =>
            updateGameState({
              screen: 'simulation',
              lecturePlan: plan,
              simulation: {
                minutesElapsed: 0,
                isPaused: false,
                speed: 1,
                seatStates: Array(SEAT_COUNT).fill('neutral'),
                activeEvent: null,
                midLectureLog: [],
                audioDisabled: false,
              },
            })
          }
          onBack={() => updateGameState({ screen: 'inventory' })}
        />
      )}
      {screen === 'simulation' && (
        <SimulationScreen
          gameState={gameState}
          updateGameState={updateGameState}
          onEnd={(result) => {
            updateGameState({
              screen: 'postLecture',
              lastLectureResult: result,
            })
          }}
        />
      )}
      {screen === 'postLecture' && (
        <PostLectureScreen
          gameState={gameState}
          onNext={(postEventExtra = {}) => {
            const result = gameState.lastLectureResult
            const newParticipation = Math.min(100, Math.max(0, gameState.participation + (result.participationDelta || 0) + (postEventExtra.participation || 0)))
            const newLearning = Math.min(100, Math.max(0, gameState.learning + (result.learningDelta || 0) + (postEventExtra.learning || 0)))
            const newPopularity = Math.min(100, Math.max(0, gameState.popularity + (result.popularityDelta || 0) + (postEventExtra.popularity || 0)))
            const won = newParticipation >= 100 && newLearning >= 100
            const nextDay = gameState.currentDay + 1
            const gameOver = nextDay > gameState.totalDays && !won

            const newHistory = [...gameState.dayHistory, result]

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
                money: prev.money + 500,
                inventory: updatedInventory,
                dayHistory: newHistory,
                screen: 'inventory',
              }))
            }
          }}
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
