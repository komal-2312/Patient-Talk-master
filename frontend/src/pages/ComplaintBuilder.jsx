import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function ComplaintBuilder() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialCategory = location.state?.category || ''

  const [label, setLabel] = useState(initialCategory)
  const [questionText, setQuestionText] = useState('')
  const [questions, setQuestions] = useState([])

  const handleAddQuestion = () => {
    if (!questionText.trim()) return
    setQuestions((prev) => [...prev, questionText.trim()])
    setQuestionText('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: hook with backend to save category + questions
    navigate('/complaints')
  }

  return (
    <div className="screen screen--centered">
      <header className="header">
        <div className="brand">
          <span className="brand-mark star" />
          <span className="brand-text">Patienttalkback.com</span>
        </div>
      </header>

      <main className="panel panel--medium">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              className="input"
              placeholder="ADD TEXT LABEL"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label className="form-label">
              <span style={{ visibility: 'hidden' }}>Image</span>
              <div className="input input--file">
                <span className="input-file-text">Select Image</span>
                <span className="input-file-icon">📁</span>
                <input type="file" className="input-file-hidden" />
              </div>
            </label>
          </div>

          <div className="form-section">
            <h2 className="form-section-title">ADD QUESTION</h2>
            <p className="question-count">Question {questions.length + 1}</p>
            <div className="form-row">
              <input
                type="text"
                className="input"
                placeholder="Enter Question text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn--secondary btn--full"
                onClick={handleAddQuestion}
              >
                ADD
              </button>
            </div>

            {questions.length > 0 && (
              <ul className="question-list">
                {questions.map((q, index) => (
                  <li key={index}>{q}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-actions form-actions--stacked">
            <button type="submit" className="btn btn--primary btn--full">
              SUBMIT
            </button>
            <button
              type="button"
              className="btn btn--disabled btn--full"
              disabled
            >
              Create Feedback
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}


