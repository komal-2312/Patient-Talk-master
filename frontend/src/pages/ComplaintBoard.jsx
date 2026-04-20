import { useNavigate } from 'react-router-dom'

const CATEGORIES = [
  { id: 'care-team', label: 'Care Team' },
  { id: 'waiting-room', label: 'Waiting Room' },
  { id: 'patient-room', label: 'Patient Room' },
  { id: 'nurse-doctor', label: 'Nurse / Doctor' },
  { id: 'lab-work', label: 'Lab Work' },
  { id: 'billing', label: 'Billing' },
  { id: 'services', label: 'Services' },
  { id: 'hygiene', label: 'Hygiene' },
]

export default function ComplaintBoard() {
  const navigate = useNavigate()

  return (
    <div className="screen">
      <header className="header header--top">
        <div className="brand">
          <span className="brand-mark star" />
          <span className="brand-text">Patienttalkback.com</span>
        </div>
      </header>

      <main className="panel panel--wide complaint-board">
        <div className="complaint-header-row">
          <div className="hospital-name-box">
            BOSTON MEMORIAL HOSPITAL
          </div>
        </div>

        <p className="complaint-subtitle">Click an Image to Provide Feedback</p>

        <div className="complaint-grid">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              className="complaint-card"
              onClick={() => navigate(`/user/feedback/${category.id}`)}
            >
              <div className="complaint-image" />
              <span className="complaint-label">{category.label}</span>
            </button>
          ))}
        </div>

      </main>
    </div>
  )
}


