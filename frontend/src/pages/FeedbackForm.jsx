import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'

const QUESTIONS = [
  'Overall experience with the hospital',
  'Cleanliness of facilities',
  'Communication from doctors and nurses',
  'Waiting time for services',
  'Likelihood to recommend this hospital',
]

export default function FeedbackForm() {
  const navigate = useNavigate()
  const { hospitalId } = useParams()
  const [form, setForm] = useState({
    name: '',
    email: '',
    visitDate: '',
    department: '',
    comments: '',
  })
  const [ratings, setRatings] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRating = (question, value) => {
    setRatings((prev) => ({ ...prev, [question]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Hook up to backend /feedback API
    // For now just navigate to thank-you-like state.
    navigate(`/hospital/${hospitalId}`)
  }

  return (
    <div className="screen screen--centered">
      <header className="header">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-text">Patienttalkback.com</span>
        </div>
      </header>

      <main className="panel panel--medium">
        <h1 className="panel-title">Feedback Form</h1>
        <p className="panel-subtitle">
          Tell us about your recent visit. Your feedback helps us improve.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="form-label">
              Patient Name
              <input
                required
                type="text"
                name="name"
                className="input"
                value={form.name}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="form-row form-row--two">
            <label className="form-label">
              Email
              <input
                required
                type="email"
                name="email"
                className="input"
                value={form.email}
                onChange={handleChange}
              />
            </label>

            <label className="form-label">
              Date of Visit
              <input
                required
                type="date"
                name="visitDate"
                className="input"
                value={form.visitDate}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="form-row">
            <label className="form-label">
              Department / Ward
              <input
                type="text"
                name="department"
                className="input"
                value={form.department}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="form-section">
            <h2 className="form-section-title">Rate your experience</h2>
            {QUESTIONS.map((q) => (
              <div key={q} className="rating-row">
                <span className="rating-question">{q}</span>
                <div className="rating-options">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={
                        ratings[q] === value
                          ? 'rating-pill rating-pill--active'
                          : 'rating-pill'
                      }
                      onClick={() => handleRating(q, value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="form-row">
            <label className="form-label">
              Additional Comments
              <textarea
                name="comments"
                rows={4}
                className="input input--textarea"
                value={form.comments}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Submit Feedback
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}


