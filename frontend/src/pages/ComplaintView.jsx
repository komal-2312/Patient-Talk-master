import { useParams } from 'react-router-dom'
import TopMenu from '../components/TopMenu'

export default function ComplaintView() {
  const { categoryId, complaintId } = useParams()

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

      <main className="panel panel--medium complaint-view">
        <button type="button" className="btn btn--secondary btn--full">
          {categoryLabel}
        </button>

        <div className="complaint-view-body">
          <div className="complaint-view-question">
            <p>Question 1</p>
            <div className="answer-box">Ans</div>
          </div>

          <div className="complaint-view-question">
            <p>Question 2</p>
            <div className="audio-bar">
              <span className="audio-icon">⏹</span>
              <div className="audio-track" />
              <span className="audio-icon">🎤</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--secondary btn--full">
            Delete Feedback
          </button>
        </div>

        <p className="question-count" style={{ textAlign: 'center', marginTop: 8 }}>
          Viewing complaint #{complaintId}
        </p>
      </main>
    </div>
  )
}


