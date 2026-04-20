import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'

const CATEGORY_LABELS = {
  'care-team': 'Care Team',
  'waiting-room': 'Waiting Room',
  'patient-room': 'Patient Room',
  'nurse-doctor': 'Nurse / Doctor',
  'lab-work': 'Lab Work',
  'billing': 'Billing',
  'services': 'Services',
  'hygiene': 'Hygiene',
}

export default function UserFeedbackForm() {
  const navigate = useNavigate()
  const { categoryId } = useParams()
  const [form, setForm] = useState({
    problemDetail: '',
    q2: '',
    q3: '',
  })
  const [ratings, setRatings] = useState({
    rating1: 0,
    rating2: 0,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRating = (ratingName, value) => {
    setRatings((prev) => ({ ...prev, [ratingName]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Hook up to backend API
    console.log('Form submitted:', { form, ratings, categoryId })
    // Navigate back to complaint board after submission
    navigate('/complaints')
  }

  const categoryLabel = CATEGORY_LABELS[categoryId] || 'Feedback'

  return (
    <div className="screen screen--centered">
      <header className="header">
        <div className="brand">
          <span className="brand-mark star" />
          <span className="brand-text">Patienttalkback.com</span>
        </div>
      </header>

      <main className="panel panel--medium user-feedback-form">
        <h1 className="panel-title">FEEDBACK FORM</h1>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="form-label">
              Describe Your Problem in Detail
              <textarea
                name="problemDetail"
                rows={6}
                className="input input--textarea"
                placeholder="Enter text"
                value={form.problemDetail}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="form-row">
            <button type="button" className="btn btn--teal btn--full">
              Submit Video Proof If Any
            </button>
          </div>

          <div className="form-row">
            <label className="form-label">
              Q2 Depend on Feedback or Complaint User will Select
              <input
                type="text"
                name="q2"
                className="input"
                placeholder="Enter text"
                value={form.q2}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="form-row">
            <label className="form-label">
              Q3 Depend on Feedback or Complaint User will Select
              <input
                type="text"
                name="q3"
                className="input"
                placeholder="Enter text"
                value={form.q3}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="divider-with-text">
            <span>OR</span>
          </div>

          <div className="form-section">
            <div className="rating-row">
              <span className="rating-question">Rating Question 1</span>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`star-button ${ratings.rating1 >= value ? 'star-button--active' : ''}`}
                    onClick={() => handleRating('rating1', value)}
                    aria-label={`Rate ${value} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="rating-row">
              <span className="rating-question">Rating Question 2</span>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`star-button ${ratings.rating2 >= value ? 'star-button--active' : ''}`}
                    onClick={() => handleRating('rating2', value)}
                    aria-label={`Rate ${value} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary btn--full">
              Submit
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

