export default function WelcomeScreen({ onNext }) {
  return (
    <div className="screen screen-welcome">
      <div className="welcome-card">
        <div className="welcome-icon">🎓</div>
        <h1>Professor</h1>
        <p className="welcome-subtitle">A Classroom Simulation Game</p>

        <div className="instructions-box">
          <h2>How to Play</h2>
          <p>
            You are a new professor at a community college. Your class is struggling — students
            aren't paying attention and aren't learning very well.
          </p>
          <p>
            Your goal: raise both <strong>Participation</strong> and <strong>Learning</strong> to
            100% before the semester ends.
          </p>

          <div className="instruction-steps">
            <div className="step">
              <span className="step-num">1</span>
              <div>
                <strong>Shop for Supplies</strong>
                <span>Use your daily salary to buy classroom materials and equipment.</span>
              </div>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <div>
                <strong>Plan Your Lecture</strong>
                <span>Adjust how you'll teach — theory vs. practice, pace, Q&A time, group work.</span>
              </div>
            </div>
            <div className="step">
              <span className="step-num">3</span>
              <div>
                <strong>Teach Class</strong>
                <span>Watch your students in real time. React to their behavior mid-lecture.</span>
              </div>
            </div>
            <div className="step">
              <span className="step-num">4</span>
              <div>
                <strong>Review & Repeat</strong>
                <span>See how the lecture went, then prep for the next day.</span>
              </div>
            </div>
          </div>

          <div className="tips-box">
            <strong>Pro Tips</strong>
            <ul>
              <li>Audio equipment (microphones, speakers) dramatically helps back-row students.</li>
              <li>Your <strong>Popularity</strong> affects how engaged students are from day one.</li>
              <li>Group work backfires when your popularity is low — earn it first!</li>
              <li>Watch for random events that can shake up your classroom.</li>
            </ul>
          </div>
        </div>

        <button className="btn btn-primary btn-large" onClick={onNext}>
          Start Game
        </button>
      </div>
    </div>
  )
}
