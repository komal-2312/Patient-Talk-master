import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import TopMenu from '../components/TopMenu'

const INITIAL_QUESTIONS = ['Question 1 (ALREADY IN FORM)', 'Question 2 (ALREADY IN FORM)', 'Question 3 (ALREADY IN FORM)']

const INITIAL_COMPLAINTS = ['Complaint 1', 'Complaint 2', 'Complaint 3']

export default function ComplaintForm() {
  const { categoryId } = useParams()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState(INITIAL_QUESTIONS)
  const [questionText, setQuestionText] = useState('')
  const [complaints] = useState(INITIAL_COMPLAINTS)

  const handleAddQuestion = () => {
    if (!questionText.trim()) return
    setQuestions((prev) => [...prev, questionText.trim()])
    setQuestionText('')
  }

  const handleDeleteQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const categoryLabel = (categoryId || '').replace(/-/g, ' ').toUpperCase() || 'BOSTON MEMORIAL HOSPITAL'

  return (
    <div className="screen">
      <header className="header header--top">
        <div className="brand">
          <span className="brand-mark star" />
          <span className="brand-text">Patienttalkback.com</span>
        </div>
        <div className="header-actions">
          <TopMenu />
        </div>
      </header>

      <main className="panel panel--medium complaint-form">
        <button type="button" className="btn btn--secondary btn--full">
          {categoryLabel}
        </button>

        <div className="question-list-existing">
          {questions.map((q, index) => (
            <div key={index} className="question-existing-row">
              <span>{q}</span>
              <button
                type="button"
                className="icon-button"
                aria-label="Delete question"
                onClick={() => handleDeleteQuestion(index)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="divider-with-text">
          <span>OR</span>
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
        </div>

        <div className="complaints-list-section">
          <h3 className="complaints-title">COMPLAINTS OR FEEDBACK</h3>
          <div className="complaints-list">
            {complaints.map((complaint, index) => (
              <div key={index} className="complaint-row">
                <button type="button" className="complaint-pill">
                  COMPLAINT
                </button>
                <button
                  type="button"
                  className="btn btn--secondary complaint-view-btn"
                  onClick={() => navigate(`/complaints/${categoryId || 'hospital'}/view/${index + 1}`)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="feedback-controls">
          <div className="toggle-row">
            <span>CLOSE FEEDBACK TEMPORARILY</span>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider" />
            </label>
          </div>

          <button type="button" className="btn btn--danger btn--full" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            DESOWN WHOLE FEEDBACK <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '6px'}}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>

          <button type="button" className="btn btn--secondary btn--full" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            DOWNLOAD FEEDBACK QR <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '6px'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>
      </main>
    </div>
  )
}


